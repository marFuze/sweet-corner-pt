module.exports = (req, res, next) => {
    const path = req.path
    const body = req.body
    const params = req.params

    console.log(`defalut logger: \nPath -> ${path},${body},${params}`)
    next()
}