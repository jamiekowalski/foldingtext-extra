#!/usr/bin/ruby -w

# Used with FoldingText WikiLink Handler (Applescript App)

require 'uri'

doc_path = ARGV[0]
search_term_uri = ARGV[1]
search_term = URI.decode_www_form_component(search_term_uri)

doc_folder = doc_path.slice(/^.+\//);

files = Dir[doc_folder + '*.{md,ft,txt}']

target_file = nil

files.each do |file|
    if (file.match(Regexp.new(Regexp.escape(search_term), Regexp::IGNORECASE)))
        target_file = file
        break
    end
end

if not target_file.nil?
    target_file.gsub!(/"/){ %q[\"] }
    
    # open the file in the default app for its type
    %x[open "#{target_file}"]
    
    # this next version will always open in FoldingText, but it sometimes fails due
    # to permissions. May be a sandboxing issue
    # %x[osascript -e 'tell application "FoldingText" to open "#{target_file}"']
else
    # if file was not found, search for it in Notational Velocity (or nvALT)
    %x[open "nv://find/#{search_term_uri}"]
end
