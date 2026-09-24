from pathlib import Path
import base64, io, html
from PIL import Image, ImageDraw
import qrcode

root=Path('/home/ubuntu/Big-Cruise-App'); out=root/'public'/'assets'; out.mkdir(parents=True,exist_ok=True)
art=out/'cruise-id-artwork.png'; header=out/'cruise-x-header.png'; reference=Path('/home/ubuntu/upload/9ED31C24-EC82-46F8-877E-FBD29F22E10E.png')

def b64(path): return base64.b64encode(path.read_bytes()).decode()
def data_uri(path,mime): return f'data:{mime};base64,{b64(path)}'
def esc(v): return html.escape(v,quote=True)
def qr(path):
    q=qrcode.QRCode(version=4,box_size=12,border=3); q.add_data('https://big-cruise.app/member/BCH-6F3K-9Z7P');q.make(fit=True)
    q.make_image(fill_color='#17120f',back_color='#fff8e7').save(path)
qrfile=out/'cruise-id-qr.png'; qr(qrfile)
# Create a circular avatar crop from the supplied reference image; the crop preserves the illustrated member avatar.
avatar=out/'cruise-id-avatar.png'
img=Image.open(reference).convert('RGBA'); crop=img.crop((74,95,382,395)).resize((520,520))
mask=Image.new('L',(520,520),0); ImageDraw.Draw(mask).ellipse((0,0,519,519),fill=255); crop.putalpha(mask);crop.save(avatar)

def svg(path,w,h,content,bg):
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
    <defs><filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="gold" x1="0" x2="1"><stop stop-color="#ffe37b"/><stop offset=".45" stop-color="#ffd400"/><stop offset="1" stop-color="#b47a00"/></linearGradient></defs>
    <image href="{data_uri(bg,'image/png')}" x="0" y="0" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice"/>
    <rect x="20" y="20" width="{w-40}" height="{h-40}" rx="40" fill="#05050555" stroke="url(#gold)" stroke-width="5" filter="url(#glow)"/>{content}</svg>'''
    path.write_text(s)

def png(svg_path,png_path):
    import subprocess
    subprocess.run(['chromium','--headless','--no-sandbox','--disable-gpu',f'--screenshot={png_path}','--window-size=1800,1200',f'file://{svg_path}'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

W,H=1800,1200
front=f'''
<image href="{data_uri(avatar,'image/png')}" x="95" y="245" width="330" height="330"/>
<circle cx="260" cy="410" r="178" fill="none" stroke="#ffd400" stroke-width="7"/>
<text x="90" y="105" font-family="Arial,sans-serif" font-size="25" letter-spacing="8" fill="#fff8e7">MORE BANTER. MORE VIBES. ONE CRUISE.</text>
<text x="1250" y="108" font-family="Arial,sans-serif" font-size="25" letter-spacing="5" fill="#ffd400">♛ OFFICIAL MEMBER</text>
<text x="500" y="330" font-family="Arial,sans-serif" font-size="68" font-weight="900" fill="#fff8e7">FX<tspan fill="#ffd400">〽</tspan></text>
<text x="505" y="385" font-family="Arial,sans-serif" font-size="30" fill="#fff8e7">@13fxiii</text>
<text x="505" y="445" font-family="Arial,sans-serif" font-size="34" fill="#ffd400">Big Cruiser · PLAYZONE MVP</text>
<text x="505" y="500" font-family="Arial,sans-serif" font-size="24" font-style="italic" fill="#fff8e7">“Just here for the vibes.”</text>
<rect x="90" y="650" width="1020" height="145" rx="24" fill="#090909cc" stroke="#ffd40088"/>
<text x="140" y="710" font-family="Arial,sans-serif" font-size="38" font-weight="900" fill="#ffd400">3.1K+</text><text x="140" y="752" font-family="Arial,sans-serif" font-size="20" fill="#fff8e7">COMMUNITY</text>
<text x="390" y="710" font-family="Arial,sans-serif" font-size="38" font-weight="900" fill="#ffd400">TOP 1%</text><text x="390" y="752" font-family="Arial,sans-serif" font-size="20" fill="#fff8e7">ENGAGEMENT</text>
<text x="675" y="710" font-family="Arial,sans-serif" font-size="38" font-weight="900" fill="#ffd400">LVL 28</text><text x="675" y="752" font-family="Arial,sans-serif" font-size="20" fill="#fff8e7">PLAYZONE</text>
<text x="900" y="710" font-family="Arial,sans-serif" font-size="38" font-weight="900" fill="#ffd400">OG</text><text x="900" y="752" font-family="Arial,sans-serif" font-size="20" fill="#fff8e7">SINCE 2024</text>
<text x="95" y="895" font-family="Arial,sans-serif" font-size="24" letter-spacing="6" fill="#fff8e7">BCH ACHIEVEMENTS</text>
<text x="95" y="955" font-family="Arial,sans-serif" font-size="23" fill="#ffd400">♨ OG Cruiser</text><text x="350" y="955" font-family="Arial,sans-serif" font-size="23" fill="#ffd400">♛ Top Engager</text><text x="640" y="955" font-family="Arial,sans-serif" font-size="23" fill="#ffd400">★ Community MVP</text>
<text x="95" y="1080" font-family="cursive" font-size="42" font-style="italic" fill="#ffd400">Big Cruise〽 — Connect / Vibe / Cruise</text>
<text x="1260" y="880" font-family="Arial,sans-serif" font-size="20" letter-spacing="5" fill="#fff8e7">MEMBER ID</text><rect x="1215" y="905" width="420" height="70" rx="20" fill="#050505dd" stroke="#ffd400"/><text x="1245" y="950" font-family="monospace" font-size="29" letter-spacing="4" fill="#fff8e7">BCH-6F3K-9Z7P</text>
<text x="1260" y="1030" font-family="Arial,sans-serif" font-size="23" fill="#ffd400">TODAY · MCM GOLD ACCENT</text>'''
svg(root/'cruise-id-front.svg',W,H,front,art); png(root/'cruise-id-front.svg',out/'cruise-id-front.png')

back=f'''
<text x="95" y="115" font-family="Arial,sans-serif" font-size="46" font-weight="900" fill="#ffd400">BIG CRUISE〽</text><text x="95" y="160" font-family="Arial,sans-serif" font-size="20" letter-spacing="7" fill="#fff8e7">THE BIGGEST VIBE COMMUNITY</text>
<text x="95" y="290" font-family="Arial,sans-serif" font-size="34" fill="#fff8e7">Entertainment. Banter. Memes. Music.</text><text x="95" y="345" font-family="Arial,sans-serif" font-size="34" fill="#fff8e7">Games. Culture. Vawulence. One Cruise.</text>
<text x="95" y="610" font-family="cursive" font-size="65" font-style="italic" fill="#ffd400">Biggest Vibes.</text><text x="95" y="685" font-family="cursive" font-size="65" font-style="italic" fill="#ffd400">Loudest Community.</text>
<text x="95" y="825" font-family="Arial,sans-serif" font-size="22" letter-spacing="6" fill="#fff8e7">REAL VIBES    REAL PEOPLE    REAL FUN    REAL CULTURE</text>
<text x="95" y="1050" font-family="Arial,sans-serif" font-size="24" letter-spacing="6" fill="#fff8e7">SCAN / CONNECT / PLAY</text>
<image href="{data_uri(qrfile,'image/png')}" x="1280" y="220" width="390" height="390"/><rect x="1250" y="190" width="450" height="450" rx="24" fill="none" stroke="#ffd400" stroke-width="4"/><text x="1300" y="700" font-family="Arial,sans-serif" font-size="24" fill="#fff8e7">SCAN TO VIEW PROFILE</text><text x="1300" y="750" font-family="monospace" font-size="23" fill="#ffd400">ID: BCH-6F3K-9Z7P</text>
<text x="1080" y="1050" font-family="cursive" font-size="38" font-style="italic" fill="#ffd400">Big Cruise〽</text>'''
svg(root/'cruise-id-back.svg',W,H,back,art); png(root/'cruise-id-back.svg',out/'cruise-id-back.png')

header_content='''<rect x="80" y="680" width="1180" height="240" rx="30" fill="#050505aa"/><text x="130" y="780" font-family="Arial,sans-serif" font-size="62" font-weight="900" fill="#fff8e7">FX<tspan fill="#ffd400">〽</tspan> · BIG CRUISER</text><text x="135" y="850" font-family="Arial,sans-serif" font-size="28" letter-spacing="5" fill="#ffd400">MORE BANTER · MORE VIBES · ONE CRUISE</text><text x="135" y="900" font-family="cursive" font-size="36" font-style="italic" fill="#ffd400">Big Cruise〽</text>'''
svg(root/'cruise-x-header.svg',1800,1200,header_content,header); png(root/'cruise-x-header.svg',out/'cruise-x-header-final.png')
print('created',out/'cruise-id-front.png',out/'cruise-id-back.png',out/'cruise-x-header-final.png')
