import http from 'node:http';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import { Ludo } from '@ayshrj/ludo.js';

const PORT = Number(process.env.PORT || 3000);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required');
}

const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify({ok:true,service:'big-cruise-realtime'}));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET','POST'] },
  transports: ['websocket','polling'],
});

const rooms = new Map();

function userClient(token) {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function loadRoom(token, code) {
  const sb = userClient(token);
  const [{ data: session, error: sessionError }, { data: players, error: playersError }] = await Promise.all([
    sb.from('game_sessions').select('id,room_code,game,state,version,status').eq('room_code', code).order('started_at',{ascending:false}).limit(1).maybeSingle(),
    sb.from('game_players').select('user_id,display_name,ready,is_host').eq('room_code', code).order('joined_at'),
  ]);
  if (sessionError) throw sessionError;
  if (playersError) throw playersError;
  if (!session) throw new Error('Game session not found');
  if (!(players || []).some(p => p.user_id === sb.auth.getUser ? undefined : false)) {
    // Membership is checked explicitly below with the current user's id.
  }
  return { session, players: players || [], sb };
}

async function authenticate(token) {
  if (!token) throw new Error('Authentication required');
  const sb = userClient(token);
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) throw new Error('Invalid session');
  return { user:data.user, sb };
}

async function isMember(token, code, userId) {
  const sb = userClient(token);
  const { data, error } = await sb.from('game_players').select('user_id,display_name,ready,is_host').eq('room_code',code).eq('user_id',userId).maybeSingle();
  if (error) throw error;
  return data || null;
}

async function ensureRoom(socket, code) {
  const token = socket.handshake.auth?.token;
  if (!token) throw new Error('Authentication required');
  const { user } = await authenticate(token);
  const member = await isMember(token, code, user.id);
  if (!member) throw new Error('You are not in this room');
  let room = rooms.get(code);
  if (!room) {
    const loaded = await loadRoom(token, code);
    room = {
      code,
      game: loaded.session.game,
      sessionId: loaded.session.id,
      version: Number(loaded.session.version || 0),
      state: loaded.session.state || null,
      players: loaded.players,
      ludo: null,
      ludoUsers: new Map(),
    };
    rooms.set(code, room);
  }
  return { room, user, member };
}

function publicRoom(room) {
  return {
    code: room.code,
    game: room.game,
    version: room.version,
    state: room.state,
    players: room.players.map(p => ({
      id:p.user_id,
      displayName:p.display_name,
      ready:Boolean(p.ready),
      host:Boolean(p.is_host),
    })),
  };
}

function emitState(room) {
  io.to(`game:${room.code}`).emit('game:state', publicRoom(room));
}

function getLudoEngine(room) {
  if (!room.ludo) {
    const count = Math.max(2, Math.min(4, room.players.length));
    room.ludo = new Ludo(count);
    room.ludoUsers = new Map(room.players.slice(0,count).map((p,i) => [p.user_id, room.ludo.players[i]]));
    room.state = room.ludo.getCurrentState();
  }
  return room.ludo;
}

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const { user } = await authenticate(token);
    socket.user = user;
    next();
  } catch (e) {
    next(new Error(e instanceof Error ? e.message : 'Authentication failed'));
  }
});

io.on('connection', socket => {
  socket.emit('realtime:ready', {userId:socket.user.id});

  socket.on('game:join', async ({code}) => {
    try {
      const normalized = String(code || '').trim().toUpperCase();
      if (!normalized) throw new Error('Room code required');
      const {room} = await ensureRoom(socket, normalized);
      socket.join(`game:${normalized}`);
      socket.data.roomCode = normalized;
      socket.emit('game:state', publicRoom(room));
      socket.to(`game:${normalized}`).emit('presence:join', {userId:socket.user.id});
    } catch (e) {
      socket.emit('room:error',{message:e instanceof Error?e.message:'Could not join room'});
    }
  });

  socket.on('game:leave', () => {
    const code=socket.data.roomCode;
    if(!code)return;
    socket.leave(`game:${code}`);
    socket.to(`game:${code}`).emit('presence:leave',{userId:socket.user.id});
    socket.data.roomCode=null;
  });

  socket.on('draw:stroke', async ({stroke}) => {
    try {
      const code=socket.data.roomCode;
      if(!code) throw new Error('Join a room first');
      const {room,user}=await ensureRoom(socket,code);
      const state=room.state;
      if(room.game!=='draw') throw new Error('This room is not Draw It Out');
      if(!state || state.drawerId!==user.id || !state.roundActive) throw new Error('Only the active drawer can draw');
      if(state.roundEndsAt && Date.now()>=Number(state.roundEndsAt)) throw new Error('Round has ended');
      if(!stroke || !['begin','move','end','clear','erase'].includes(stroke.tool)) throw new Error('Invalid stroke');
      const clean={
        x:Number(stroke.x||0),y:Number(stroke.y||0),
        color:String(stroke.color||'#F5C400').slice(0,16),
        size:Math.max(1,Math.min(40,Number(stroke.size||5))),
        tool:stroke.tool,
      };
      io.to(`game:${code}`).emit('draw:stroke', {stroke:clean, by:user.id});
    } catch(e) {
      socket.emit('room:error',{message:e instanceof Error?e.message:'Stroke rejected'});
    }
  });

  socket.on('draw:presence', ({x,y}) => {
    const code=socket.data.roomCode;
    if(code) socket.to(`game:${code}`).emit('draw:presence',{userId:socket.user.id,x:Number(x),y:Number(y)});
  });

  socket.on('ludo:state', async () => {
    try {
      const code=socket.data.roomCode;
      if(!code) throw new Error('Join a room first');
      const {room}=await ensureRoom(socket,code);
      if(room.game!=='ludo') throw new Error('This room is not Ludo');
      const game=getLudoEngine(room);
      room.state=game.getCurrentState();
      emitState(room);
    } catch(e) { socket.emit('room:error',{message:e instanceof Error?e.message:'Ludo unavailable'}); }
  });

  socket.on('ludo:roll', async () => {
    try {
      const code=socket.data.roomCode;
      const {room,user}=await ensureRoom(socket,code);
      if(room.game!=='ludo') throw new Error('This room is not Ludo');
      const game=getLudoEngine(room);
      const color=room.ludoUsers.get(user.id);
      if(color!==game.currentPiece) throw new Error('Not your turn');
      game.rollDiceForCurrentPiece();
      room.state=game.getCurrentState();
      emitState(room);
    } catch(e) { socket.emit('room:error',{message:e instanceof Error?e.message:'Ludo roll rejected'}); }
  });

  socket.on('ludo:move', async ({tokenIndex}) => {
    try {
      const code=socket.data.roomCode;
      const {room,user}=await ensureRoom(socket,code);
      if(room.game!=='ludo') throw new Error('This room is not Ludo');
      const game=getLudoEngine(room);
      const color=room.ludoUsers.get(user.id);
      if(color!==game.currentPiece) throw new Error('Not your turn');
      const index=Number(tokenIndex);
      if(!game.validTokenIndices.includes(index)) throw new Error('Illegal token');
      game.selectToken(index);
      room.state=game.getCurrentState();
      emitState(room);
    } catch(e) { socket.emit('room:error',{message:e instanceof Error?e.message:'Ludo move rejected'}); }
  });

  socket.on('disconnect', () => {
    const code=socket.data.roomCode;
    if(code) socket.to(`game:${code}`).emit('presence:leave',{userId:socket.user.id});
  });
});

httpServer.listen(PORT,()=>console.log(`BIG CRUISE realtime listening on :${PORT}`));
