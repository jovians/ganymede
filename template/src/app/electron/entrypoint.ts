// Add custom ts imports here.

export class ElectronCustomLogics {
  static fromElectron = true;
  static preinit() {
    // Add entrypoint initialization here
    // to be imported to electron main logic
    console.log('electron entrypoint (user-custom) pre-init');
  }
  static postinit() {
    // Add entrypoint initialization here
    // to be imported to electron main logic
    console.log('electron entrypoint (user-custom) post-init');
  }
}
