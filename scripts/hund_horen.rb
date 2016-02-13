#
# Copyright (C) 2016 Souza (Husky) [https://github.com/udfds]
# Based on Marco Mornati [http://www.mornati.net]
#
# License: GNU General Public License (Licença Pública Geral)
#
# This program detects the presence of sound and invokes a program.
#

require 'getoptlong'
require 'optparse'
require 'net/smtp'
require 'logger'
require 'date'
require 'net/http'

HW_DETECTION_CMD = "cat /proc/asound/cards"
# You need to replace MICROPHONE with the name of your microphone, as reported
# by /proc/asound/cards
SAMPLE_DURATION = 5 # seconds
FORMAT = 'S16_LE'   # this is the format that my USB microphone generates
THRESHOLD = 0.05
RECORD_FILENAME='/home/pi/sandbox/noise.wav'
LOG_FILE='/home/pi/sandbox/log/noise_detector.log'
PID_FILE='/home/pi/sandbox/noised/noised.pid'

logger = Logger.new(LOG_FILE)
logger.level = Logger::DEBUG

logger.info("Noise detector started @ #{DateTime.now.strftime('%d/%m/%Y %H:%M:%S')}")


def self.check_required()
  if !File.exists?('/usr/bin/arecord')
    warn "/usr/bin/arecord not found; install package alsa-utils"
    exit 1
  end

  if !File.exists?('/usr/bin/sox')
    warn "/usr/bin/sox not found; install package sox"
    exit 1
  end

  if !File.exists?('/proc/asound/cards')
    warn "/proc/asound/cards not found"
    exit 1
  end

end

# Parsing script parameters
options = {}
optparse = OptionParser.new do |opts|
  opts.banner = "Usage: noise_detection.rb -m ID [options]"

  opts.on("-m", "--microphone SOUND_CARD_ID", "REQUIRED: Set microphone id") do |m|
    options[:microphone] = m
  end
  opts.on("-s", "--sample SECONDS", "Sample duration") do |s|
    options[:sample] = s
  end
  opts.on("-n", "--threshold NOISE_THRESHOLD", "Set Activation noise Threshold. EX. 0.1") do |n|
    options[:threshold] = n
  end
  opts.on("-v", "--[no-]verbose", "Run verbosely") do |v|
    options[:verbose] = v
  end
  opts.on("-d", "--detect", "Detect your sound cards") do |d|
    options[:detection] = d
  end
  opts.on("-t", "--test SOUND_CARD_ID", "Test soundcard with the given id") do |t|
    options[:test] = t
  end
  opts.on("-k", "--kill", "Terminating background script") do |k|
    options[:kill] = k
  end
end.parse!

if options[:kill]
  logger.info("Terminating script");
  logger.debug("Looking for pid file in #{PID_FILE}")
  begin
    pidfile = File.open(PID_FILE, "r")
    storedpid = pidfile.read
    Process.kill("TERM", Integer(storedpid))
  rescue Exception => e
    logger.error("Cannot read pid file: " + e.message)
    exit 1
  end
  exit 0
end

if options[:detection]
    puts "Detecting your soundcard..."
    puts `#{HW_DETECTION_CMD}`
    exit 0
end

#Check required binaries
check_required()

if options[:sample]
    SAMPLE_DURATION = options[:sample]
end

if options[:threshold]
    THRESHOLD = options[:threshold].to_f
end

if options[:test]
    puts "Testing soundcard..."
    puts `/usr/bin/arecord -D plughw:#{options[:test]},0 -d #{SAMPLE_DURATION} -f #{FORMAT} 2>/dev/null | /usr/bin/sox -t .wav - -n stat 2>&1`
    exit 0
end

optparse.parse!

#Now raise an exception if we have not found a host option
raise OptionParser::MissingArgument if options[:microphone].nil?

if options[:verbose]
   logger.debug("Script parameters configurations:")
   logger.debug("SoundCard ID: #{options[:microphone]}")
   logger.debug("Sample Duration: #{SAMPLE_DURATION}")
   logger.debug("Output Format: #{FORMAT}")
   logger.debug("Noise Threshold: #{THRESHOLD}")
   logger.debug("Record filename (overwritten): #{RECORD_FILENAME}")
end

#Starting script part
pid = fork do
  stop_process = false
  Signal.trap("USR1") do
    logger.debug("Running...")
  end
  Signal.trap("TERM") do
    logger.info("Terminating...")
    File.delete(PID_FILE)
    stop_process = true
  end

  loop do
    if (stop_process)
	    logger.info("Noise detector stopped @ #{DateTime.now.strftime('%d/%m/%Y %H:%M:%S')}")
	    break
    end
    rec_out = `/usr/bin/arecord -D plughw:#{options[:microphone]},0 -d #{SAMPLE_DURATION} -f #{FORMAT} -t wav #{RECORD_FILENAME} 2>/dev/null`
    out = `/usr/bin/sox -t .wav #{RECORD_FILENAME} -n stat 2>&1`
    out.match(/Maximum amplitude:\s+(.*)/m)
    amplitude = $1.to_f
    logger.debug("Detected amplitude: #{amplitude}") if options[:verbose]
    if amplitude > THRESHOLD
      logger.info("Sound detected!!!")

      uri = URI('http://localhost:1880/noisedetector')
      params = { :amplitude => amplitude }
      uri.query = URI.encode_www_form(params)
      puts Net::HTTP.get_response(uri)

      # Sleep 20 seconds (15s to Bird Song + 3s to Internet delay)
      sleep 20
    else
      logger.debug("No sound detected...")
    end
end
end

Process.detach(pid)
logger.debug("Started... (#{pid})")
File.open(PID_FILE, "w") { |file| file.write(pid) }
