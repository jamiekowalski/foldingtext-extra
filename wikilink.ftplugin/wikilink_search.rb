#!/usr/bin/ruby -w

require 'uri'
require 'logger'

search_folders = [
    '~/Dropbox/Notes/',
    '~/Dropbox/Notes Archive/',
    
]
extensions = 'md,ft,txt,png,jpg,jpeg,pdf'

def openFile file
    target_file = file.gsub(/"/){ %q[\"] }
    
    # open the file in the default app for its type
    %x[open "#{target_file}"]
    
    # this next version will always open in FoldingText, but it sometimes fails due
    # to permissions. May be a sandboxing issue
    # %x[osascript -e 'tell application "FoldingText" to open "#{target_file}"']
end

def openInNV search_term
    %x[open "nv://find/#{search_term}"]
end

if ARGV[0] == '-f'

    search_term_uri = ARGV[1]
    search_term = URI.decode_www_form_component(search_term_uri)
    doc_path = ARGV[2]
    
    file_glob = search_term.gsub(/[^\w\-]+/, '*') + "*.{#{extensions}}"
    file_glob.gsub!(/\*+/, '*')
        
    if (not doc_path.nil?) and doc_path.length > 0
        doc_folder = doc_path.slice(/^.+\//)
        search_folders.unshift doc_folder
    end
    
    target_file = nil
    search_folders.each do |folder|
        folder.strip!
        folder.gsub!(/^~/, Dir.home)
        folder << '/' if not folder.match(/\/$/)
        
        files = Dir.glob(folder + file_glob, File::FNM_CASEFOLD)
        
        if files.length > 0
            target_file = files[0]
            break
        end
    end
        
    if not target_file.nil?
        openFile target_file
    else
        # if file was not found, search for it in Notational Velocity (or nvALT)
        openInNV search_term_uri
    end

elsif ARGV[0] == '-n'
    openInNV ARGV[1]
end
