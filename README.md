# Wachhund

<p>System of monitoring temperature and noise detection to Raspberry PI.</p>

Descrição da arquitetura em portugues: [Wachhund, monitoramento de ambiente com Raspberry Pi](https://medium.com/@Husky08/wachhund-%C3%A9-um-sistema-de-monitoramento-de-temperatura-e-som-ru%C3%ADdo-com-a-finalidade-de-emitir-3421dad8edab)


=== 

<h3>Instalação</h3>

- Atualize o Rasperry Pi e o Node-RED 
- Utilizando um protoboard e um ds18b20, instale o sensor de temperatura conforme o tutorial do thepihut
 - O objetivo dessa instalação é permite a execução do comando 'cat /sys/bus/w1/devices/28-XXXXXXXXXXXX/w1_slave' para obter a temperatura atual. O script descrito no tutorial é desnecessario para o Wachhund, sua função é realizada pelo flow de temperatura.
- Usando o diretorio home como base, crie os seguintes diretorios:
 - home/pi/script # Diretorio para armazenr o script de audio
 - home/pi/music  # Diretorio para armazenar a musica a ser executada pelo flow de audio
 - home/pi/sandbox/log, home/pi/sandbox/noised # Diretorios utilizado pelo script de audio para gravar e analisar audio
- Crie uma conta no IFTTT
- Ative o canal Maker do IFTTT e copie a KEY de acesso
 - Crie e configure os recipes conforme descrito o arquivo recipes/ifttt.txt
- Configure o Node-RED para iniciar sempre que o Raspberry Pi for iniciado
- Adicione todos os flows 
- Atualize todos os nodes relacionado ao IFTTT para utilizado sua chave do Maker
- Conecte um microfone USB ao Raspberry Pi
- Adicione o script hund_horen.rb a pasta home/pi/script e execute o script

===

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
