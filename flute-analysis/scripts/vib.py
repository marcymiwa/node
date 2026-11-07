import numpy as np, sys
d=np.load(sys.argv[1]); t,db=d['t'],d['db']; dt=t[1]-t[0]
for a,b in [(25.2,27.4),(29.5,32.3),(35.2,39),(39,43),(46,49.5),(49.5,53.2),(64.5,71),(126.5,131.8),(135.2,137.8),(140.6,145.9),(148.8,151),(170,176),(180.5,187),(190.5,197.5),(232.3,233.6),(244,245.2),(246,247.5),(256.3,258.9),(264,269.5),(278,281),(283.6,288),(307.2,310.5),(316,318),(353.5,357.2)]:
    s=(t>=a)&(t<=b); x=db[s]; x=x-np.polyval(np.polyfit(np.arange(len(x)),x,2),np.arange(len(x)))
    F=np.abs(np.fft.rfft(x*np.hanning(len(x)),n=8192)); fr=np.fft.rfftfreq(8192,dt); band=(fr>2.5)&(fr<12)
    print(f"{a:6.1f}-{b:6.1f} AMrate {fr[band][np.argmax(F[band])]:4.1f}Hz  AMdepth(pp) {np.percentile(x,95)-np.percentile(x,5):4.1f}dB  level {np.median(db[s]):5.1f}")
