import numpy as np, librosa, sys, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
d=np.load(sys.argv[1]); t,db,f0,vp=d['t'],d['db'],d['f0'],d['vprob']; on=d['onsets']
y,sr=librosa.load(sys.argv[2],sr=22050)
W=[(29,33),(134.5,138.5),(169,178),(204,220),(231,249),(255,260),(262,271),(277,289),(307,320),(345,358)]
fig,ax=plt.subplots(len(W),2,figsize=(16,2.2*len(W)))
for k,(a,b) in enumerate(W):
    s=(t>=a)&(t<=b); v=s&~np.isnan(f0)&(vp>0.3)
    ax[k,0].plot(t[s],db[s],lw=.6); [ax[k,0].axvline(o,c='r',lw=.4) for o in on if a<=o<=b]; ax[k,0].set_ylim(-60,0); ax[k,0].set_ylabel(f'{a}-{b}')
    ax[k,0].twinx().plot(t[v],librosa.hz_to_midi(f0[v]),'.',ms=1,c='g')
    seg=y[int(a*sr):int(b*sr)]; Sx=librosa.amplitude_to_db(np.abs(librosa.stft(seg,n_fft=2048,hop_length=256)),ref=np.max)
    ax[k,1].imshow(Sx[:600],origin='lower',aspect='auto',cmap='magma',vmin=-70,vmax=0,extent=[a,b,0,600*sr/2048])
plt.tight_layout(); plt.savefig(sys.argv[3],dpi=70)
