import styles from './jigsaw.css'
import loadImgs from './assets';

const w = 310 // canvas宽度
const h = 155 // canvas高度
const l = 42 // 滑块边长
const r = 9 // 滑块半径
const PI = Math.PI
const L = l + r * 2 + 3 // 滑块实际边长

function getRandomNumberByRange(start, end) {
  return Math.round(Math.random() * (end - start) + start)
}

function createCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}


function createElement(tagName, className) {
  const element = document.createElement(tagName)
  className && (element.setAttribute('class', styles[className]))
  return element
}

function setClass(element, className) {
  element.setAttribute('class', styles[className])
}

function addClass(element, className) {
  const preClass = element.getAttribute('class');
  element.setAttribute('class', `${styles[className]} ${preClass}`)
}

function removeClass(element, className) {
  let preClass = element.getAttribute('class');
  const reg = new RegExp(styles[className], 'g')
  preClass = preClass.replace(reg, '');
  preClass = preClass.replace(/\s+/g, ' ');
  element.setAttribute('class', preClass)
}


function drawPath(ctx, x, y, operation) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI)
  ctx.lineTo(x + l, y)
  ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI)
  ctx.lineTo(x + l, y + l)
  ctx.lineTo(x, y + l)
  ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true)
  ctx.lineTo(x, y)
  ctx.lineWidth = 2
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.stroke()
  ctx.globalCompositeOperation = 'destination-over'
  operation === 'fill' ? ctx.fill() : ctx.clip()
}

function sum(x, y) {
  return x + y
}

function square(x) {
  return x * x
}

class Jigsaw {
  constructor({ el, width = w, height = h, imgs = [], onSuccess, onFail, onRefresh }) {
    Object.assign(el.style, {
      position: 'relative',
      width: width + 'px',
      margin: '0 auto'
    })
    this.width = width
    this.height = height
    this.el = el
    this.imgs = imgs && imgs.length > 0 ? imgs : loadImgs
    this.onSuccess = onSuccess
    this.onFail = onFail
    this.onRefresh = onRefresh
  }

  init() {
    this.initDOM()
    this.initImg()
    this.bindEvents()
  }

  initDOM() {
    const { width, height } = this
    const canvas = createCanvas(width, height) // 画布
    const block = createCanvas(width, height) // 滑块
    setClass(block, 'jigsaw__block')
    const sliderContainer = createElement('div', 'jigsaw__sliderContainer')
    sliderContainer.style.width = width + 'px'
    sliderContainer.style.pointerEvents = 'none'
    const refreshIcon = createElement('div', 'jigsaw__refreshIcon')
    const sliderMask = createElement('div', 'jigsaw__sliderMask')
    const slider = createElement('div', 'jigsaw__slider')
    const sliderIcon = createElement('span', 'jigsaw__sliderIcon')
    const text = createElement('span', 'jigsaw__sliderText')
    text.innerHTML = 'Slide the piece into place.'

    // 增加loading
    const loadingContainer = createElement('div', 'jigsaw__loadingContainer')
    loadingContainer.style.width = width + 'px'
    loadingContainer.style.height = height + 'px'
    const loadingIcon = createElement('div', 'jigsaw__loadingIcon')
    const loadingText = createElement('span')
    loadingText.innerHTML = 'loading...'
    loadingContainer.appendChild(loadingIcon)
    loadingContainer.appendChild(loadingText)



    slider.appendChild(sliderIcon)
    sliderMask.appendChild(slider)
    sliderContainer.appendChild(sliderMask)
    sliderContainer.appendChild(text)

    const jigsawNode = createElement('div', 'jigsaw__wrapper'); // 最外层包裹元素

    // 父元素包括所有元素
    jigsawNode.appendChild(loadingContainer);
    jigsawNode.appendChild(canvas);
    jigsawNode.appendChild(refreshIcon);
    jigsawNode.appendChild(block);
    jigsawNode.appendChild(sliderContainer);

    this.el.appendChild(jigsawNode)


    Object.assign(this, {
      canvas,
      block,
      sliderContainer,
      loadingContainer,
      refreshIcon,
      slider,
      sliderMask,
      sliderIcon,
      text,
      canvasCtx: canvas.getContext('2d'),
      blockCtx: block.getContext('2d')
    })
  }

  setLoading(isLoading) {
    this.loadingContainer.style.display = isLoading ? '' : 'none'
    this.sliderContainer.style.pointerEvents = isLoading ? 'none' : ''
  }

  initImg() {
    const img = this.createImg(() => {
      this.setLoading(false)
      this.draw(img)
    })
    this.img = img
  }

  createImg(onload) {
    let imgIdx = 0;
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = onload
    img.onerror = () => {
      img.setSrc() // 图片加载失败的时候重新加载其他图片
    }

    img.setSrc = () => {
      img.src = this.imgs[imgIdx]
      imgIdx += 1
      imgIdx = imgIdx >= this.imgs.length ? 0 : imgIdx
    }
    img.setSrc()
    return img
  }


  draw(img) {
    const { width, height } = this
    // 随机位置创建拼图形状
    this.x = getRandomNumberByRange(L + 10, width - (L + 10))
    this.y = getRandomNumberByRange(10 + r * 2, height - (L + 10))
    drawPath(this.canvasCtx, this.x, this.y, 'fill')
    drawPath(this.blockCtx, this.x, this.y, 'clip')

    // 画入图片
    this.canvasCtx.drawImage(img, 0, 0, width, height)
    this.blockCtx.drawImage(img, 0, 0, width, height)

    // 提取滑块并放到最左边
    const y = this.y - r * 2 - 1
    const ImageData = this.blockCtx.getImageData(this.x - 3, y, L, L)
    this.block.width = L
    this.blockCtx.putImageData(ImageData, 0, y)
  }

  bindEvents() {
    this.el.onselectstart = () => false
    this.refreshIcon.onclick = () => {
      this.reset()
      typeof this.onRefresh === 'function' && this.onRefresh()
    }

    let originX, originY, trail = [], isMouseDown = false
    let addClassFlag = false;
    const handleDragStart = function (e) {
      originX = e.clientX || e.touches[0].clientX
      originY = e.clientY || e.touches[0].clientY
      isMouseDown = true
      addClassFlag = true
    }
    const width = this.width
    const handleDragMove = (e) => {
      if (!isMouseDown) return false
      const eventX = e.clientX || e.touches[0].clientX
      const eventY = e.clientY || e.touches[0].clientY
      const moveX = eventX - originX
      const moveY = eventY - originY
      if (moveX < 0 || moveX + 38 >= width) return false
      this.slider.style.left = moveX + 'px'
      const blockLeft = (width - 40 - 20) / (width - 40) * moveX
      this.block.style.left = blockLeft + 'px'
      this.sliderMask.style.width = moveX + 'px'
      trail.push(moveY)
      if (addClassFlag) {
        addClass(this.sliderContainer, 'jigsaw__sliderContainer_active')
        addClassFlag = false
      }
    }

    const handleDragEnd = (e) => {
      if (!isMouseDown) return false
      isMouseDown = false
      const eventX = e.clientX || e.changedTouches[0].clientX
      if (eventX === originX) return false
      removeClass(this.sliderContainer, 'jigsaw__sliderContainer_active')
      this.trail = trail
      const { spliced, verified } = this.verify()
      if (spliced) {
        if (verified) {
          addClass(this.sliderContainer, 'jigsaw__sliderContainer_success')
          typeof this.onSuccess === 'function' && this.onSuccess()
        } else {
          addClass(this.sliderContainer, 'jigsaw__sliderContainer_fail')
          this.text.innerHTML = 'Not a match!'
          this.reset()
        }
      } else {
        addClass(this.sliderContainer, 'jigsaw__sliderContainer_fail')
        typeof this.onFail === 'function' && this.onFail()
        setTimeout(this.reset.bind(this), 1000)
      }
    }
    this.slider.addEventListener('mousedown', handleDragStart)
    this.slider.addEventListener('touchstart', handleDragStart)
    this.block.addEventListener('mousedown', handleDragStart)
    this.block.addEventListener('touchstart', handleDragStart)
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('touchmove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)
  }

  verify() {
    const arr = this.trail // 拖动时y轴的移动距离
    const average = arr.reduce(sum) / arr.length
    const deviations = arr.map(x => x - average)
    const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length)
    const left = parseInt(this.block.style.left)
    return {
      spliced: Math.abs(left - this.x) < 10,
      verified: stddev !== 0, // 简单验证拖动轨迹，为零时表示Y轴上下没有波动，可能非人为操作
    }
  }

  reset() {
    const { width, height } = this
    // 重置样式
    setClass(this.sliderContainer, 'jigsaw__sliderContainer')
    this.slider.style.left = 0 + 'px'
    this.block.width = width
    this.block.style.left = 0 + 'px'
    this.sliderMask.style.width = 0 + 'px'

    // 清空画布
    this.canvasCtx.clearRect(0, 0, width, height)
    this.blockCtx.clearRect(0, 0, width, height)

    // 重新加载图片
    this.setLoading(true)
    this.img.setSrc()
  }
}

const jigsaw = {
  init: function (opts) {
    return new Jigsaw(opts).init()
  }
}

window.jigsaw = jigsaw

export default jigsaw;
