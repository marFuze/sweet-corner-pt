

const urlImages = ( req, type, file ) => {
    const protocol = req.protocol
    const host = req.get('host')

    const url = `${protocol}://${host}/images/${type}/${file}`

    return url
}

module.exports = {urlImages}