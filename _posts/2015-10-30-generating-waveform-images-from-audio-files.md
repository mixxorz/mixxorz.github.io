---
title:  "Generating Waveform Images from Audio files"
date:   2015-10-30 11:50:00
description: With pydub and Pillow
---

A couple of weeks ago, I started talking about starting a social network for short form audio. During the process of researching for this project, we realized we needed some way to visualize the audio on the interface. Since a waveform image is the de facto visual from of audio, we decided to go with that. But then I realized,

#### _How do I generate these images with code?_

So off I went looking for solutions online. I read various blog posts about using NumPy and Matplotlib but it felt like it was a bit too much overhead for me to learn how to use scientific Python tools for my purpose.

Eventually I found a [StackOverflow answer](https://stackoverflow.com/questions/9200252/generate-thumbnail-for-arbitrary-audio-file) that instead uses [pydub](http://pydub.com/) to measure the loudness of an audio file at intervals. I now had an array of loudness levels for audio files! All I have to do now is draw the waveform.

After about half an hour of tinkering with [Pillow](https://pillow.readthedocs.org/), I had the waveform! 

**This is the generated waveform for clammbon's [Re-Chicago](https://www.youtube.com/watch?v=4D2PhoA13Tg)**
![clammbon - Re-Chicago waveform](/assets/images/2015-10-30-generating-waveform-images-from-audio-files/chicago.png)

**Here's one for [Re-Folklore](https://www.youtube.com/watch?v=IrBaq8sG7-4)**
![clammbon - Re-Folklore waveform](/assets/images/2015-10-30-generating-waveform-images-from-audio-files/folklore.png)

[Here's the script that I wrote](https://gist.github.com/mixxorz/abb8a2f22adbdb6d387f). I decided against making it a library because you're probably going to want to have your waveform look different anyway.

Hope this post helped.
