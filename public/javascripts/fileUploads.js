

FilePond.registerPlugin(
    FilePondPluginImageResize,
    FilePondPluginImagePreview,
    FilePondPluginFileEncode
);

FilePond.setOptions({
    stylePanelAspectRatio: 150 / 100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150
})

FilePond.parse(document.body);