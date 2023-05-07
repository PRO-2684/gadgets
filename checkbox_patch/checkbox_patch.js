function checkbox_patch(checkbox) {
    const { get, set } = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked');
    Object.defineProperty(checkbox, 'checked', {
        get() {
            // If you want to monitor the retrieval of the `checked` property, uncomment the line below and do whatever you like...
            // console.log('Getting "checked" property...');
            return get.call(this);
        },
        set(newVal) {
            // console.log(`Setting "checked" property to "${newVal}"...`); // Debug
            let ret = set.call(this, newVal);
            this.dispatchEvent(new Event("change"));
            return ret;
        }
    });
}
