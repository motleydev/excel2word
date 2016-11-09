const cleanText = (value) => {
  let text = value

  text = text.toLowerCase()
  text = text.replace(/ä/g, 'ae')
  text = text.replace(/ö/g, 'oe')
  text = text.replace(/ü/g, 'ue')
  text = text.replace(/ß/g, 'ss')
  text = text.replace(/ /g, '_')
  text = text.replace(/-/g, '_')
  text = text.replace(/\./g, '')
  text = text.replace(/,/g, '')
  text = text.replace(/\(/g, '')
  text = text.replace(/\)/g, '')
  return text
}

export default cleanText
