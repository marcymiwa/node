import numpy as np, librosa, sys, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
fm.fontManager.addfont('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'); plt.rcParams['font.family']='IPAGothic'
d=np.load(sys.argv[1]); t,db,f0,vp,cent,flat=d['t'],d['db'],d['f0'],d['vprob'],d['cent'],d['flat']
y,sr=librosa.load(sys.argv[2],sr=22050)
S=librosa.amplitude_to_db(np.abs(librosa.stft(y,n_fft=2048,hop_length=1024)),ref=np.max)
ts=librosa.frames_to_time(np.arange(S.shape[1]),sr=sr,hop_length=1024); fs=librosa.fft_frequencies(sr=sr,n_fft=2048)
fig,ax=plt.subplots(4,1,figsize=(18,13),sharex=True,gridspec_kw={'height_ratios':[3,2,1.3,1.3]})
ax[0].pcolormesh(ts,fs,S,shading='auto',cmap='magma',vmin=-80,vmax=0); ax[0].set_yscale('log'); ax[0].set_ylim(150,11000); ax[0].set_ylabel('Hz'); ax[0].set_title('スペクトログラム（フルート 大野さん）')
v=~np.isnan(f0)&(vp>0.5)&(db>-45)
mi=np.where(v,librosa.hz_to_midi(np.where(np.isnan(f0),1,f0)),np.nan)
ax[1].scatter(t[v],mi[v],s=0.5,c=db[v],cmap='viridis',vmin=-35,vmax=-8)
ticks=[62,67,69,74,79,81,86,88,91]; ax[1].set_yticks(ticks); ax[1].set_yticklabels([librosa.midi_to_note(m,unicode=False) for m in ticks]); ax[1].set_ylim(58,95); ax[1].grid(alpha=.3); ax[1].set_title('音の高さ（色＝音量）')
ax[2].plot(t,db,lw=.4,c='k'); ax[2].axhline(-45,c='r',lw=.6,ls='--'); ax[2].set_ylim(-70,0); ax[2].set_ylabel('dBFS'); ax[2].set_title('音量（赤線 -45dB＝鳴っている／いない の境目）'); ax[2].grid(alpha=.3)
sm=lambda x,n=40: np.convolve(x,np.ones(n)/n,'same')
ax[3].plot(t,sm(cent),lw=.6,label='明るさ（スペクトル重心 Hz）'); ax3=ax[3].twinx(); ax3.plot(t,sm(flat),lw=.6,c='tab:orange',label='息っぽさ（flatness）'); ax3.set_ylim(0,0.12)
ax[3].set_ylim(0,5000); ax[3].legend(loc='upper left'); ax3.legend(loc='upper right'); ax[3].set_xlabel('秒')
labels=[(25,'ロングトーン D4/A4/A5（ビブなし→あり）'),(64,'G 上行スケール'),(91,'d 和声的短音階 上行'),(126,'A5/D6 ビブなし→速いビブ'),(170,'D4/A4/E6 クレシェンド→ディミヌエンド'),(205,'A5 やわらか→強いアタック'),(232,'D4・E6 強弱'),(256,'B5 ゆれ'),(263,'倍音 D4→D5→A5→D6'),(278,'息の音'),(307,'メロディ（ビブ・トリル入り）')]
for k,(x,l) in enumerate(labels):
    for a in ax: a.axvline(x,c='w' if a is ax[0] else 'gray',lw=.5,alpha=.6)
    ax[1].text(x+.5,93 if k%2==0 else 90.5,l,fontsize=8,va='top')
ax[0].set_xlim(15,375); plt.tight_layout(); plt.savefig(sys.argv[3],dpi=110)
