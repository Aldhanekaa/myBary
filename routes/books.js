const express = require('express');
const router = express.Router();
// const multer = require('multer');
// const path = require('path'); // untuk joining string
// const fs = require('fs'); // fs untuk memanipulasi file di server
const Book = require('../models/book');
// const uploadPath = path.join('public', Book.coverImageBasePath); // public/uploads/bookCovers
const Author = require('../models/author');
const { route } = require('./authors');
const imageMimePath = ['image/jpeg', 'image/png']; // supported file
// const upload = multer({
//     dest: uploadPath, // destinationnya
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimePath.includes(file.mimetype))
//     }
// })

router.get('/', async (req, res) => {
    let query = Book.find();
    if (req.query.title != null) {
        req.query.title = req.query.title.trim();
    }
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
});

router.get('/new', (req, res) => {
    // res.send('new book')
    renderNewPage(res, new Book())
})

// create book
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        author: req.body.author
    });

    saveCover(book, req.body.cover);


    try {
        const newBook = await book.save();
        res.redirect('books');
    } catch (err) {
        console.log(err)
        // if (book.coverImageName != null) {
        //     removeBookCover(book.coverImageName);
        // }
        renderNewPage(res, book, true)
    }
})

// function removeBookCover(fileName) {
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if (err) console.log(err);
//     })
// }

router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate("author")
            .exec();
        res.render("books/show", { book: book });
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
});

router.get("/:id/edit", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
});

router.put("/:id", async (req, res) => {
    let book = req.body;

    if (book.cover != null && book.cover !== "") {
        saveCover(book, book.cover);
    } else {
        console.log("HELLO!")
        book.cover = new Buffer.from(book.lastFileBase64, 'base64');
    }
    delete book["lastFileBase64"];

    // console.log("boook", book)

    try {
        await Book.findByIdAndUpdate(req.params.id, book);
        res.redirect(`/books/${req.params.id}`)
    } catch (err) {
        console.log(err);
        if (book != null) {
            renderEditPage(res, book, true);
        } else {
            res.redirect("/books");
        }
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Book.findByIdAndRemove(req.params.id);
        res.redirect("/books");

    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
});

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)

}

async function renderFormPage(res, book, page, hasError = false) {
    try {
        const authors = await Author.find({});
        let params = {
            authors: authors,
            book: book,
            page: page
        }
        // console.log(params)
        if (hasError) params.errorMessage = "error has occured";
        res.render(`books/newAndShow`, params);
    } catch {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimePath.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;