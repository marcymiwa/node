import sys, json, numpy as np, librosa
path, out = sys.argv[1], sys.argv[2]
y, sr = librosa.load(path, sr=22050, mono=True)
hop = 256  # ~11.6ms
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
db = librosa.amplitude_to_db(rms, ref=1.0)
cent = librosa.feature.spectral_centroid(y=y, sr=sr, n_fft=2048, hop_length=hop)[0]
flat = librosa.feature.spectral_flatness(y=y, n_fft=2048, hop_length=hop)[0]
f0, vflag, vprob = librosa.pyin(y, fmin=220, fmax=2700, sr=sr, frame_length=2048, hop_length=hop)
onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, hop_length=hop, units='time')
t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
n = min(len(t), len(f0))
np.savez(out, t=t[:n], db=db[:n], cent=cent[:n], flat=flat[:n], f0=f0[:n], vprob=vprob[:n], onset_env=onset_env[:n], onsets=onsets)
print("frames", n, "onsets", len(onsets))
