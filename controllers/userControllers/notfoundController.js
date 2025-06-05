const notfoundController = {
    //@desc get page not found
    //GET /notfound
    notfound: (req, res) => {
        res.status(401).render('notfound')
    }
}

export default notfoundController;