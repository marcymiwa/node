import numpy as np, librosa, sys
d=np.load(sys.argv[1]); t,db,f0,vp,cent,flat=d['t'],d['db'],d['f0'],d['vprob'],d['cent'],d['flat']; dt=t[1]-t[0]
y,sr=librosa.load(sys.argv[2],sr=22050)
P=[(24.8,27.7),(29.1,32.7),(34.7,43.5),(45.6,53.6),(64.0,71.7),(73.6,75.9),(77.4,88.4),(90.9,98.7),(100.4,103.0),(104.3,112.3),(114.6,117.4),(126.0,132.2),(134.9,138.0),(140.2,146.3),(148.4,151.4),(169.6,177.2),(180.1,187.5),(190.1,197.9),(205.3,210.8),(213.8,219.0),(232.2,235.9),(238.6,242.2),(243.9,247.7),(255.8,259.1),(263.3,269.8),(277.7,281.4),(283.4,288.2),(307.1,333.4),(334.7,358.5),(360.0,369.4)]
for a,b in P:
    s=(t>=a)&(t<=b); v=s&~np.isnan(f0)&(vp>0.5)
    seq=[]
    for x in np.where(v)[0]:
        n=librosa.midi_to_note(int(round(librosa.hz_to_midi(f0[x]))),unicode=False)
        if not seq or seq[-1][0]!=n: seq.append([n,1])
        else: seq[-1][1]+=1
    seq=[f"{n}" for n,c in seq if c*dt>0.06]
    # loudness shape: 4 quarters
    q=np.array_split(db[s],4); shape=" ".join(f"{np.median(x):.0f}" for x in q)
    # AM spectrum of amplitude envelope (fine hop) for flutter detection
    seg=y[int(a*sr):int(b*sr)]
    env=np.abs(librosa.util.frame(seg,frame_length=64,hop_length=32)).mean(0); er=sr/32
    env=env-np.convolve(env,np.ones(int(er*0.1))/int(er*0.1),'same')
    F=np.abs(np.fft.rfft(env*np.hanning(len(env)))); fr=np.fft.rfftfreq(len(env),1/er)
    band=(fr>12)&(fr<40); base=(fr>40)&(fr<80)
    am=fr[band][np.argmax(F[band])]; ratio=F[band].max()/np.median(F[base])
    print(f"{a:5.0f}-{b:5.0f} dB[{shape}] cent {np.median(cent[s]):.0f} flatP90 {np.percentile(flat[s],90):.3f} AMpeak {am:4.1f}Hz x{ratio:4.1f} | {' '.join(seq[:40])}{' ...' if len(seq)>40 else ''} ({len(seq)})")
