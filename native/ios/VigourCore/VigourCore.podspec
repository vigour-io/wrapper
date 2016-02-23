#
#  Be sure to run `pod spec lint VigourCore.podspec' to ensure this is a
#  valid spec and to remove all comments including this before submitting the spec.
#
#  To learn more about Podspec attributes see http://docs.cocoapods.org/specification.html
#  To see working Podspecs in the CocoaPods repo see https://github.com/CocoaPods/Specs/
#

Pod::Spec.new do |s|


  s.name         = "VigourCore"
  s.version      = "1.0.0"
  s.summary      = "Wraps iOS native stuff to JS."
  s.description  = <<-DESC
  Builds a set of native apps from a single javascript codebase.
                   DESC
  s.homepage     = "http://www.vigour.io"
  s.license = { :type => "MIT", :file => "LICENSE" }
  s.author             = { "Alexander van der Werff" => "avdwerff@gmail.com" }
  s.platform     = :ios, "9.0"
  s.source       = { :git => "https://github.com/vigour-io/wrapper.git", :branch => "feature/core-framework" }
  
  s.source_files = "VigourCore/**/*.{swift}"
  s.requires_arc = true

end
