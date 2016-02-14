# Wachhund

<p>System of monitoring temperature and noise detection to Raspberry PI.</p>

Software modules:
 - Scripts (Ruby), controller of noise detection
 - Recipes (IFTTT), storage to data
 - Flows (Node-RED), interface to input and output
<br>

Hardware modules: 
- microfone usb
- ds18b20, temperature sensor

===

<h4>Flows (Node-RED)</h4>
<p>After import the flow, edit the node of IFTTT and replace IFTTT_KEY with your key.</p>

- Flow: On Boot, post IP
 - Save the full output of ifconfig command - Event: **rpi_post_ip**
 - Create a notification, to display the current ip of Raspberry PI  - Event: **rpi_put_ip**
    
- Flow: On Noise, play song
 - Play song (home/pi/Music/oi6RGg.mp3)
 - Log the noise detection - Event: **rpi_post_noise**
    
- Flow: On Time (Mon-Fri, 7h at 19h), post temperature
 - Log the temperature - Event: **rpi_post_temperature**

===

<h4>Recipes (IFTTT)</h4>
  - Event **rpi_post_noise**: Storage the noise detection data
  - Event **rpi_put_ip**: Storage the output of ifconfig on Raspberry reboot
  - Event **rpi_post_ip**: Create a notification with ip of Raspberry
  - Event **rpi_post_temperature**: Storage the temperature data

===

<h4>Scripts (Ruby)</h4>
  - hund_horen.rb
  <br> Detects the presence of sound and do a get to "/noisedetection" - (Flow: On Noise, play song)

===

<h5>Todo</h5>
 - Replace methot 'get' to 'post' on **hund_horen.rb**
 - Append current temperature of city in the event of **rpi_post_temperature**
 - Add Mongodb to save output of Flows
  - Create a REST API to access the data
 - Create a integration with Slack
