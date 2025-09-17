# Usage: `use` this file in your config.nu

# Kills all adobe-related processes.
export def main [] {
    let list = [CCLibrary, CCXProcess, CoreSync, AdobeIPCBroker, "Adobe Crash Processor"];
    let adobes = ps | where { |p| ($p.name | str substring 0..-5) in $list };
    $adobes | each { |p| kill --force $p.pid; print ("Killed " + $p.name) };
    print ("✅ Killed " + ($adobes | length | into string) + " processes");
}
