import numpy as np, librosa, sys
d = np.load(sys.argv[1]); t,db,cent,flat,f0,vp = d['t'],d['db'],d['cent'],d['flat'],d['f0'],d['vprob']
on = d['onsets']
active = db > -45
# segments of activity (merge gaps < 1.0s, drop < 0.3s)
segs=[]; i=0; N=len(t); dt=t[1]-t[0]
while i<N:
    if active[i]:
        j=i
        while j<N and active[j]: j+=1
        segs.append([t[i],t[j-1]]); i=j
    else: i+=1
m=[]
for s in segs:
    if m and s[0]-m[-1][1]<1.2: m[-1][1]=s[1]
    else: m.append(s)
m=[s for s in m if s[1]-s[0]>0.4]
print("== phrases ==")
for k,(a,b) in enumerate(m):
    sel=(t>=a)&(t<=b); v=sel&~np.isnan(f0)&(vp>0.5)
    notes=librosa.hz_to_note(f0[v]) if v.any() else []
    lo=hi=med='-'
    if v.any():
        mi=librosa.hz_to_midi(f0[v]); lo=librosa.midi_to_note(np.percentile(mi,2)); hi=librosa.midi_to_note(np.percentile(mi,98)); med=librosa.midi_to_note(np.median(mi))
    vr=v.sum()/max(sel.sum(),1)
    no=((on>=a)&(on<=b)).sum()
    print(f"{k+1:2d} {a:6.1f}-{b:6.1f} ({b-a:5.1f}s) dB med {np.median(db[sel]):5.1f} max {db[sel].max():5.1f} | pitch {lo}..{hi} med {med} voiced {vr:.0%} | cent {np.median(cent[sel]):5.0f}Hz flat {np.median(flat[sel]):.3f} | onsets {no} ({no/(b-a):.1f}/s)")
v=~np.isnan(f0)&(vp>0.5)&active
mi=librosa.hz_to_midi(f0[v])
print("\n== overall pitch ==")
for p in [1,5,25,50,75,95,99]: print(p, librosa.midi_to_note(np.percentile(mi,p)), round(float(librosa.midi_to_hz(np.percentile(mi,p))),1))
h=np.bincount(np.round(mi).astype(int)%12, minlength=12); names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
print("pitch class %:", {names[i]: round(100*h[i]/h.sum(),1) for i in np.argsort(-h)})
oct_ = np.round(mi).astype(int)//12-1
print("octave %:", {int(o): round(100*(oct_==o).mean(),1) for o in np.unique(oct_)})
# tuning
dev = (mi-np.round(mi))*100
print("tuning offset median cents:", round(float(np.median(dev)),1), " A4 est:", round(440*2**(np.median(dev)/1200),1))
print("\n== loudness (active) ==")
for p in [5,25,50,75,95,99.5]: print(p, round(float(np.percentile(db[active],p)),1))
print("noise floor (quiet) median dB:", round(float(np.median(db[~active])),1), "p95", round(float(np.percentile(db[~active],95)),1))
print("\n== timbre (voiced vs unvoiced active) ==")
uv=active&~v
print("centroid voiced med", int(np.median(cent[v])), "unvoiced", int(np.median(cent[uv])))
print("flatness voiced med", round(float(np.median(flat[v])),4), "p90", round(float(np.percentile(flat[v],90)),4), "| unvoiced med", round(float(np.median(flat[uv])),4))
# vibrato: within long stable notes, measure f0 modulation rate/depth
print("\n== vibrato ==")
rates=[];depths=[]
mi_full=np.where(v, librosa.hz_to_midi(np.where(np.isnan(f0),1,f0)), np.nan)
i=0
while i<N:
    if v[i]:
        j=i
        while j<N and v[j] and abs(mi_full[j]-mi_full[i])<0.8: j+=1
        if (j-i)*dt>0.7:
            seg=mi_full[i:j]-np.mean(mi_full[i:j]); seg=seg-np.polyval(np.polyfit(np.arange(len(seg)),seg,1),np.arange(len(seg)))
            F=np.abs(np.fft.rfft(seg*np.hanning(len(seg)))); fr=np.fft.rfftfreq(len(seg),dt)
            band=(fr>3)&(fr<9)
            if band.any():
                rates.append(fr[band][np.argmax(F[band])]); depths.append(np.std(seg)*100*1.414)
        i=max(j,i+1)
    else: i+=1
rates=np.array(rates);depths=np.array(depths)
print("long notes", len(rates), "rate Hz med", round(float(np.median(rates)),2), "IQR", np.round(np.percentile(rates,[25,75]),2), "depth cents med", round(float(np.median(depths)),1), "IQR", np.round(np.percentile(depths,[25,75]),1))
print("\n== note lengths ==")
# note segmentation via rounded midi change
r=np.where(v, np.round(mi_full), -1)
L=[];i=0
while i<N:
    if r[i]>0:
        j=i
        while j<N and r[j]==r[i]: j+=1
        if (j-i)*dt>0.05: L.append((j-i)*dt)
        i=j
    else: i+=1
L=np.array(L); print("notes", len(L), "dur percentiles", np.round(np.percentile(L,[10,25,50,75,90,99]),2))
