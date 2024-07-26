require 'sinatra'

get '/' do
  send_file File.expand_path('views/index.html', __dir__)
end