import numpy as np, librosa, sys
y,sr=librosa.load(sys.argv[1],sr=None, mono=True)  # 48k
S=np.abs(librosa.stft(y,n_fft=2048,hop_length=512))**2; f=librosa.fft_frequencies(sr=sr,n_fft=2048); t=librosa.frames_to_time(np.arange(S.shape[1]),sr=sr,hop_length=512)
bands=[(20,250),(250,800),(800,2000),(2000,5000),(5000,10000),(10000,20000)]
def share(a,b):
    s=(t>=a)&(t<=b); E=S[:,s].sum(1); tot=E.sum()
    return [round(100*E[(f>=lo)&(f<hi)].sum()/tot,1) for lo,hi in bands]
print("bands", bands)
for name,a,b in [("D4 long",24.8,27.7),("A5 long",45.6,53.6),("E6 long",190.1,197.9),("scale G",77.4,88.4),("harm? 263",263.3,269.8),("bright A5 126",126,132.2),("breath 278",277.7,281.4),("breath 283",283.4,288.2),("melody 307",307.1,333.4),("silence 5-20",5,20)]:
    print(f"{name:14s}", share(a,b))
# HF ratio time series threshold suggestion
hf=S[(f>=5000)].sum(0); lf=S[(f>=250)&(f<2500)].sum(0)
r=10*np.log10((hf+1e-12)/(lf+1e-12))
for name,a,b in [("tones",24.8,270),("breath",277.7,288.2),("melody",307,369)]:
    s=(t>=a)&(t<=b)&(10*np.log10(S.sum(0)+1e-12)>np.percentile(10*np.log10(S.sum(0)+1e-12),30))
    print(name,"HF/LF dB p10/50/90", np.round(np.percentile(r[s],[10,50,90]),1))
