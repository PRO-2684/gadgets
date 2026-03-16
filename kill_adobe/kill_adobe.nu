# Usage: `use` this file in your config.nu, then execute `kill_adobe` in the shell to kill all adobe-related processes.

# Kills all adobe-related processes.
export def main [] {
    let list = [CCLibrary, CCXProcess, CoreSync, AdobeIPCBroker, "Adobe Crash Processor", AdobeNotificationClient];
    let adobes = ps | where { |p| ($p.name | str substring 0..-5) in $list };
    $adobes | each { |p| kill --force $p.pid; print ("Killed " + $p.name) };
    print ("✅ Killed " + ($adobes | length | into string) + " processes");
}
