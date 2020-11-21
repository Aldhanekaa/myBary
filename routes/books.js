const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require('../models/book');
const uploadPath = path.join('public', Book.bookCoverImagePath);
const Author = require('../models/author');
const imageMimePath = ['image/jpeg', 'image/png']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimePath.includes(file.mimetype))
    }
})

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

router.get('/new', async (req, res) => {
    // res.send('new book')
    renderNewPage(res, new Book())
})

// create book
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        author: req.body.author
    })

    try {
        const newBook = await book.save();
        res.redirect('books')
    } catch (err) {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err);
    })
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        let params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = "error has occured";
        res.render('books/new', params);
    } catch {
        res.redirect('/books')
    }
}

module.exports = router;