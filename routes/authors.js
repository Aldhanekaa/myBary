const express = require('express');
const router = express.Router();
const Author = require('../models/author')
const Book = require('../models/book');

router.get('/', async (req, res) => {
    let searchOptions = {};

    if (req.query.name) {
        searchOptions.name = new RegExp(req.query.name.trim(), 'i')
    }
    try {
        const authors = await Author.find(searchOptions);

        if (req.query.name != null) req.query.name = req.query.name.trim();

        res.render('authors/index', { authors: authors, author: req.query })
    } catch (err) {
        console.log(err)
        res.redirect('/');
    }
});

router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author(), status: false });
})

// create author
router.post('/', async (req, res) => {
    console.log(req.body);
    const author = new Author({
        name: req.body.name.trim()
    });
    try {
        const newAuthor = await author.save();
        // res.redirect(`authors/${newAuthor.id}`)
        res.redirect('/authors')
    } catch {
        res.render("authors/new", { author: author, errorMessage: "error has occured", status: false });
    }
});

router.get("/:id", async (req, res) => {
    // console.log(req.params)
    try {
        const author = await Author.findById(req.params.id);
        let books = await Book.find({ author: author.id }).limit(6).exec();
        res.render("authors/show", { author: author, Books: books })
    } catch (err) {
        console.log(err)
        res.redirect("/")
    }
    // res.send(`Show Author: ${req.params.id}`);
});

router.get("/:id/edit", async (req, res) => {
    // res.send(`Edit Author: ${req.params.id}`);
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/new', { author: author, status: true });

    } catch (err) {
        console.log(err);
        res.redirect('/authors');
    }

});

router.put("/:id", async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);

        author.name = req.body.name;

        await author.save();
        res.redirect(`/authors/${author.id}`);

    } catch (err) {
        console.log(err);

        if (author == null) {
            res.redirect("/")
        }

        res.render("authors/new", { author: author, status: true, errorMessage: "Failed to update author!" });
    }
});

router.delete("/:id", async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);

        await author.remove(); // delete author from database;
        res.redirect(`/authors`);

    } catch (err) {
        console.log(err);

        if (author == null) {
            res.redirect("/")
        } else {
            res.redirect(`/authors/${author.id}`);
        }
    }
});




module.exports = router; 