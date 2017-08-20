Ajax File Upload Demo
===

## Tech stack

1. express/ejs/scss
2. client side: use vanilla XMLHttpRequest Level 2
3. demo formidable usage
4. demo multer usage

### XMLHTTPRequest Level 2 (from SO)

Uploading files is actually possible with AJAX these days. Yes, AJAX, not some crappy AJAX wannabes like swf or java.

This example might help you out: http://js1.hotblocks.nl/tests/ajax/file-drag-drop.html

(It also includes the drag/drop interface but that's easily ignored.)

Basically what it comes down to is this:
```html

<input id="files" type="file" />

<script>
document.getElementById('files').addEventListener('change', function(e) {
    var file = this.files[0];
    var xhr = new XMLHttpRequest();
    (xhr.upload || xhr).addEventListener('progress', function(e) {
        var done = e.position || e.loaded
        var total = e.totalSize || e.total;
        console.log('xhr progress: ' + Math.round(done/total*100) + '%');
    });
    xhr.addEventListener('load', function(e) {
        console.log('xhr upload complete', e, this.responseText);
    });
    xhr.open('post', '/URL-HERE', true);
    xhr.send(file);
});
</script>

```

(demo: http://jsfiddle.net/rudiedirkx/jzxmro8r/)

So basically what it comes down to is this =)

```js
xhr.send(file);
```

Where `file` is typeof `Blob`: http://www.w3.org/TR/FileAPI/

Another (better IMO) way is to use FormData. This allows you to 1) name a file, like in a form and 2) send other stuff (files too), like in a form.

```js

var fd = new FormData;
fd.append('photo1', file);
fd.append('photo2', file2);
fd.append('other_data', 'foo bar');
xhr.send(fd);

```

`1`FormData` makes the server code cleaner and more backward compatible (since the request now has the exact same format as normal forms).

All of it is not experimental, but very modern. Chrome 8+ and Firefox 4+ know what to do, but I don't know about any others.

This is how I handled the request (1 image per request) in PHP:

```php
if ( isset($_FILES['file']) ) {
    $filename = basename($_FILES['file']['name']);
    $error = true;

    // Only upload if on my home win dev machine
    if ( isset($_SERVER['WINDIR']) ) {
        $path = 'uploads/'.$filename;
        $error = !move_uploaded_file($_FILES['file']['tmp_name'], $path);
    }

    $rsp = array(
        'error' => $error, // Used in JS
        'filename' => $filename,
        'filepath' => '/tests/uploads/' . $filename, // Web accessible
    );
    echo json_encode($rsp);
    exit;
}
```

### References
1. JavaScript高级程序设计
2. https://stackoverflow.com/questions/4856917/jquery-upload-progress-and-ajax-file-upload