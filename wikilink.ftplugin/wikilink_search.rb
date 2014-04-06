#!/usr/bin/ruby -w

require 'uri'

def silence_warnings(&block)
  warn_level = $VERBOSE
  $VERBOSE = nil
  result = block.call
  $VERBOSE = warn_level
  result
end

if RUBY_VERSION.to_f > 1.9
  silence_warnings do
    Encoding.default_external = Encoding::UTF_8
    Encoding.default_internal = Encoding::UTF_8
  end
end

# search folder strings may start with ~ for home folder; final slash is optional
search_folders = [
  '~/Dropbox/Notes/',
  '~/Dropbox/Text Files/Reading Notes/',
  '~/Desktop/',
]
search_current_folder = true
recursive = true                                # also search subfolders?
extensions = 'md,ft,txt,png,jpg,jpeg,pdf'       # comma-separated list
ft_extensions = 'md,ft,txt'                     # set this to filetypes registered
                                                # to open with FoldingText
filter_delim = '#'
applescript_path = Dir.home + '/Library/Containers/com.foldingtext.FoldingText/' + 
  'Data/Library/Application Support/FoldingText/Plug-Ins/wikilink.ftplugin/' + 
  'Open document with filter.scpt'

def openFile( file, filter_path, applescript_path, ft_extensions, filter_delim )
  
  target_file = file.gsub(/"/){ %q[\"] }
  
  ft_extensions = ft_extensions.dup.gsub(',', '|')
  
  if target_file.match(Regexp.new(%[\.(#{ft_extensions})$]))
    
    if filter_path.nil?
      filter_path = ""
    else
      if filter_path[0] == filter_delim
        filter_path = filter_path[1..-1]
      end
      filter_path.gsub!(/[^\-\w]/, ' ')   # except \w or dash, replace with space
      filter_path.gsub!(/\s+/, ' and ')
      
      filter_path = "//#{filter_path} and @type=heading///*/ancestor-or-self::*"
    end
    
    filter_path.gsub!(/"/){ %q[\"]} 
    %x[osascript "#{applescript_path}" "#{target_file}" "#{filter_path}"]
  else
    # open the file in the default app for its type
    %x[open "#{target_file}"]
  end
  
  # this next version will always open in FoldingText, but it sometimes fails due
  # to permissions. May be a sandboxing issue
  # %x[osascript -e 'tell application "FoldingText" to open "#{target_file}"']
end

def openInNV search_term
  %x[open "nv://find/#{search_term}"]
end

search_term_i = 0
doc_path_i = 1

if ARGV.length < 1 # must be at least 1 argument
  exit
end

search_term_uri = ARGV[search_term_i]
search_term = URI.decode_www_form_component(search_term_uri)

filter_path = nil
if not search_term[filter_delim].nil?
  index = search_term.index filter_delim
  filter_path = search_term[index..-1].strip
  search_term = search_term[0..index-1].strip
end

# prepare file glob
file_glob = search_term.gsub(/[^\w\-]+/, '*') + "*.{#{extensions}}"
file_glob = '*' + file_glob            # allow search to start in middle of filename
file_glob.gsub!(/\*+/, '*')            # clean up successive *'s
if recursive
  file_glob = '**/' + file_glob
end

# add current folder to search folders
if search_current_folder
  doc_path = ''
  if ARGV.length > doc_path_i
    doc_path = ARGV[doc_path_i]
  end

  if doc_path.length > 0
    doc_folder = doc_path.slice(/^.+\//)
    search_folders.unshift doc_folder
  end
end

# search for file
target_file = nil
search_folders.each do |folder|
  folder.strip!
  folder.gsub!(/^~/, Dir.home)
  folder << '/' if not folder[-1] == '/'
  
  files = Dir.glob(folder + file_glob, File::FNM_CASEFOLD)
  
  if files.length > 0
    target_file = files[0]
    break
  end
end

# open file, if found
if not target_file.nil?
  openFile( target_file, filter_path, applescript_path, ft_extensions, filter_delim )
else
  # if file was not found, search for it in Notational Velocity (or nvALT)
  openInNV( search_term_uri )
end
