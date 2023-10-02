const isValid = text => {
  const listIndex = listsArr.findIndex(list => list.current === true)
  return listsArr[listIndex].todos.some(todo => todo.name === text)
}

const isValidList = text => listsArr.some(obj => obj.listName === text)

const listsArr = []

const addTask = event => {
  if (event.key !== "Enter") return
  if (!event.target.value) {
    alert('Please enter task name')
    return
  }
  if (isValid(event.target.value)) {
    alert('Task already exist')
    return
  }
  
  const todo = {
    name: event.target.value,
    complete: false,
    id: 0
  }
  
  const index = listsArr.findIndex(list => list.current === true)
  listsArr[index].todos.push(todo)
  
  createLi(event.target.value, complete = false, id = 0)
  event.target.value = ''
  setId()
  changeBarWidth()
  noTodos()
  localStorage.setItem('lists', JSON.stringify(listsArr))
}

const setId = () => {
  const index = listsArr.findIndex(list => list.current === true)
  listsArr[index].todos.forEach((todo, i) => todo.id = i)
  document.querySelectorAll('.todo').forEach((todo, i) => todo.id = i)  
}

document.querySelector('.input-todo').addEventListener('keydown', addTask)

const removeTask = event => {
  event.target.parentNode.remove()
  const listIndex = listsArr.findIndex(list => list.current === true)
  const todoIndex = listsArr[listIndex].todos.findIndex(todo => todo.name === event.target.parentNode.textContent)
  listsArr[listIndex].todos.splice(todoIndex, 1)

  localStorage.setItem('lists', JSON.stringify(listsArr))
  setId()
  changeBarWidth()
  noTodos()
}


const clearTasks = () => {
  const listIndex = listsArr.findIndex(list => list.current === true)
  listsArr[listIndex].todos = listsArr[listIndex].todos.filter(todo => !todo.complete)
  document.querySelectorAll('.done-todos .todo').forEach(todoLi => todoLi.remove())
  setId()
  changeBarWidth()
  noTodos()
  localStorage.setItem('lists', JSON.stringify(listsArr))
}
const clearButton = document.querySelector('.clear')
clearButton.addEventListener('click', clearTasks)
 
const changeStatus = event => {
  const listIndex = listsArr.findIndex(list => list.current === true)
  const todoIndex = listsArr[listIndex].todos.findIndex(todo => todo.name === event.target.parentNode.textContent)
  listsArr[listIndex].todos[todoIndex].complete = event.target.checked
  document.querySelectorAll('.todo').forEach(todo => todo.remove())
  listsArr[listIndex].todos.forEach(todo => createLi(todo.name, todo.complete, todo.id))
  localStorage.setItem('lists', JSON.stringify(listsArr))
  setId()
  changeBarWidth()
  noTodos()
}

document.querySelectorAll('.check-todo').forEach(ch => ch.addEventListener('change', changeStatus))

const changeBarWidth = () => {
  const active = document.querySelectorAll('.my-todos .todo').length 
  const done = document.querySelectorAll('.done-todos .todo').length
  const activeBarWidth = Math.round(active * 100 / (active + done)) + '%'
  const doneBarWidth = Math.round(done * 100 / (active + done)) + '%'
  document.querySelector('.progress-bar.active .line').style.width = activeBarWidth
  document.querySelector('.progress-bar.complete .line').style.width = doneBarWidth
}

// window.addEventListener("beforeunload", updateLocalStorage)

window.addEventListener('DOMContentLoaded', () => {
  if (!JSON.parse(localStorage.getItem('lists'))) return
  JSON.parse(localStorage.getItem('lists')).forEach(list => listsArr.push(list))
  listsArr.sort((a, b) => a.listId > b.listId ? 1 : -1).forEach(list => {
    createList(list.listId, list.listName, list.current, list.todos)
  })

  const index = listsArr.findIndex(list => list.current === true)
  const currentArr = listsArr[index].todos
  currentArr.forEach(todo => createLi(todo.name, todo.complete, todo.id))
  setId()
  changeBarWidth()
  document.querySelector('.input-todo').focus()
  document.querySelector('h1').textContent = document.querySelector('.current').textContent
  noTodos()
});

const createLi = (name, complete = false, id) => {
  
  const li = document.createElement('li')
  li.className = 'todo'
  li.draggable = true
  li.id = id
  li.ondragstart = dragStart
  li.ondragenter = dragEnter
  li.ondragleave = dragLeave
  li.ondragend = onDrop
  li.ondragover = onDragover
  li.ondblclick = changeText
  li.onmouseenter = addBlueBackground
  li.onmouseleave = removeBlueBackground
  const input = document.createElement('input')
  input.className = 'check-todo'
  input.type = 'checkbox'
  input.onchange = changeStatus
  li.append(input)

  const span = document.createElement('span')
  span.className = 'todoitem'
  span.innerHTML = name
  li.append(span)

  const img = document.createElement('img')
  img.className = 'delete'
  img.src = 'icons/delete.gif'
  img.onclick = removeTask
  li.append(img)

  if (complete) {
    input.checked = true
    document.querySelector('.done-todos').append(li)
  } else {
    document.querySelector('.my-todos').append(li)
  }
  noTodos()
}

let startItem
let mouse
let emptySection

const createEmptySection = () => {
  if (document.querySelector('.emptySection')) return
  emptySection = document.createElement('li')
  emptySection.classList.add("emptySection")
  if (document.querySelector('.my-todos').childNodes.length - 3 === 0) {
  document.querySelector('.my-todos').append(emptySection)
  } else if (document.querySelector('.done-todos').childNodes.length - 1 === 0) {
    document.querySelector('.done-todos').append(emptySection)
    }
  emptySection.ondragend = onDrop
  emptySection.ondragover = onDragover
}


const isAbove = node => {
  // const rect = node.getBoundingClientRect().top;
  const { top } = node.getBoundingClientRect()
  // https://learn.javascript.ru/destructuring
  const offset = node.offsetHeight
  return mouse < top + offset / 2
}

const dragStart = event => {
  startItem = event.target.closest('.todo')
  startItem.classList.add('is-dragging')
  document.querySelectorAll('.todatasks').forEach(list => {
    list.style = 'pointer-events:none'
  })
  startItem.childNodes.item(0).hidden = true
  
}

const dragEnter = event => {
  event.preventDefault()
}

const onDragover = event => {
  event.preventDefault()
  createEmptySection()
  mouse = event.clientY
  document.querySelectorAll('.lists>li').forEach(list => {
    list.style = 'pointer-events:none'
  })
  if (event.target !== emptySection) {
    if (isAbove(event.target.closest('.todo'))) {
      event.target.closest('.todo').parentNode.insertBefore(startItem, event.target.closest('.todo'))
    } else {
      event.target.closest('.todo').parentNode.insertBefore(startItem, event.target.closest('.todo').nextSibling)
    }
  } else {
    emptySection.parentNode.insertBefore(startItem, emptySection)
  }
  document.querySelectorAll('.todo').forEach(todo => {
    todo.classList.remove('hover')
  })
}

const dragLeave = event => {
  event.preventDefault()
}

const onDrop = () => {
  document.querySelectorAll('.todo').forEach(todo => todo.classList.remove('is-dragging'))
  if(document.querySelector('.emptySection')) {
    emptySection.parentNode.removeChild(emptySection)
  }
  document.querySelectorAll('.done-todos .todo').forEach(todo => todo.childNodes[0].checked = true)
  document.querySelectorAll('.my-todos .todo').forEach(todo => todo.childNodes[0].checked = false)

  const listIndex = listsArr.findIndex(list => list.current === true)
  const todoIndex = listsArr[listIndex].todos.findIndex(todo => todo.name === startItem.textContent)
  listsArr[listIndex].todos[todoIndex].complete = startItem.childNodes[0].checked
  const filteredTodos = []
  document.querySelectorAll('.todo').forEach(todo => {
    const todoFiltered = {
      name : todo.textContent,
      complete : todo.childNodes[0].checked,
      id : '',
    }
    filteredTodos.push(todoFiltered)
  })
  listsArr[listIndex].todos = filteredTodos

  startItem.childNodes.item(0).hidden = false

  document.querySelectorAll('.lists>li').forEach(list => {
    list.style = 'pointer-events:auto'
  })
  setId()
  changeBarWidth()
  noTodos()
  localStorage.setItem('lists', JSON.stringify(listsArr))
}

const changeText = event => {
  if (document.querySelector('.changeTextInput')) return

  event.target.closest('li').draggable = false
  const placeEditor = document.createElement('input')
  placeEditor.className = 'changeTextInput'
  placeEditor.type = 'text'
  placeEditor.draggable = false
  placeEditor.value = event.target.closest('li').textContent
  event.target.closest('li').children[0].after(placeEditor)

  const saveButton = document.createElement('input')
  saveButton.className = 'saveButton'
  saveButton.type = 'submit'
  saveButton.value = 'save'
  placeEditor.after(saveButton)
  saveButton.onclick = saveChanges
  
  const cancelButton = document.createElement('input')
  cancelButton.className = 'cancelButton'
  cancelButton.type = 'submit'
  cancelButton.value = 'cancel'
  saveButton.after(cancelButton)
  cancelButton.onclick = cancelEdition

  event.target.closest('li').children[4].hidden = true
  event.target.closest('li').children[0].hidden = true
}

const saveChanges = (event) => {
  const listIndex = listsArr.findIndex(list => list.current === true)
  const todoIndex = listsArr[listIndex].todos.findIndex(todo => todo.name === event.target.closest('li').textContent)

  event.target.parentNode.querySelector('span').textContent = event.target.previousSibling.value
  event.target.parentNode.querySelector('span').hidden = false
  event.target.parentNode.querySelector('.check-todo').hidden = false
  event.target.closest('li').draggable = true

  listsArr[listIndex].todos[todoIndex].name = event.target.previousSibling.value
  event.target.parentNode.querySelectorAll('input:not(.check-todo').forEach(element => element.remove());
  localStorage.setItem('lists', JSON.stringify(listsArr))
}

const cancelEdition = event => {
  event.target.parentNode.querySelector('span').hidden = false
  event.target.parentNode.querySelector('.check-todo').hidden = false
  event.target.closest('li').draggable = true
  event.target.parentNode.querySelectorAll('input:not(.check-todo').forEach(element => element.remove());
}

document.querySelector('.normal').onclick = () => {
  document.querySelectorAll('.todo').forEach(todo => todo.remove())
  const listIndex = listsArr.findIndex(list => list.current === true)
  listsArr[listIndex].todos.sort((a, b) => a.id > b.id ? 1 : -1).forEach(todo => {
    createLi(todo.name, todo.complete, todo.id)
    localStorage.setItem('lists', JSON.stringify(listsArr))
  })

}


document.querySelector('.alphabetical').onclick = () => {
  document.querySelectorAll('.todo').forEach(todo => todo.remove())
  const listIndex = listsArr.findIndex(list => list.current === true)
  listsArr[listIndex].todos.sort((a, b) => a.name > b.name ? 1 : -1).forEach(todo => {
    createLi(todo.name, todo.complete, todo.id)
    localStorage.setItem('lists', JSON.stringify(listsArr))
  })

}

document.querySelector('.random').onclick = () => {
  document.querySelectorAll('.todo').forEach(todo => todo.remove())
  const listIndex = listsArr.findIndex(list => list.current === true)
  listsArr[listIndex].todos.sort(() => Math.random() - 0.5).forEach(todo => {
    createLi(todo.name, todo.complete, todo.id)
    localStorage.setItem('lists', JSON.stringify(listsArr))
  })
}

const addList = () => {
  
  const listItem = document.createElement('li')
  listItem.className = 'todaytasks'
  listItem.onclick = selectList
  listItem.draggable = true
  listItem.ondragstart = dragStartList
  listItem.ondragenter = dragEnterList
  listItem.ondragleave = dragLeaveList
  listItem.ondragend = onDropList
  listItem.ondragover = onDragoverList
  document.querySelector('.lists').append(listItem)

  const placeEditorList = document.createElement('input')
  placeEditorList.className = 'changeInputList'
  placeEditorList.type = 'text'
  listItem.append(placeEditorList)
  placeEditorList.onkeydown = saveChangesList
  placeEditorList.focus()

  const saveButtonList = document.createElement('input')
  saveButtonList.className = 'saveButtonList'
  saveButtonList.type = 'submit'
  saveButtonList.value = 'save'
  saveButtonList.onclick = saveChangesList
  placeEditorList.after(saveButtonList)

  const cancelButtonList = document.createElement('input')
  cancelButtonList.className = 'cancelButtonList'
  cancelButtonList.type = 'submit'
  cancelButtonList.value = 'cancel'
  saveButtonList.after(cancelButtonList)
  cancelButtonList.onclick = cancelChengesList
}

document.querySelector('.addlist').addEventListener('click', addList)

const saveChangesList = event => {
  if (event.key !== "Enter" & event.type !== 'click') return
  if (!document.querySelector('.changeInputList').value) {
    alert('Please enter list name')
    return
  }

  if (isValidList(document.querySelector('.changeInputList').value)) {
    alert('List already exist')
    return
  }
  const span = document.createElement('span')
  span.className = 'category_todo'

  span.textContent = document.querySelector('.changeInputList').value
  event.target.closest('li').append(span)
   
  const imgList = document.createElement('img')
  imgList.className = 'delete'
  imgList.src = 'icons/delete.gif'
  event.target.closest('li').append(imgList)
  imgList.onclick = removeList

  document.querySelectorAll('.todaytasks').forEach(element => element.classList.remove('current'))
  event.target.closest('li').classList.add('current')

  const list = {
    listId: 0,
    listName: document.querySelector('.changeInputList').value,
    current: true,
    todos: []
  }

  listsArr.forEach(list => list.current = false)

  listsArr.push(list)
 
  listsArr.forEach((list, i) => {
    list.listId = 'myList_' + i
  })
  document.querySelectorAll('.todaytasks').forEach((list, i) => {
    list.id = 'myList_' + i
  }) 

  document.querySelector('.changeInputList').remove()
  document.querySelector('.saveButtonList').remove()
  document.querySelector('.cancelButtonList').remove()
  
  
  document.querySelectorAll('.todo').forEach(todo => todo.remove())
  localStorage.setItem('lists', JSON.stringify(listsArr))
  document.querySelector('h1').textContent = document.querySelector('.current').textContent
  event.stopPropagation()
  noTodos()
}


const cancelChengesList = (event) => {
  event.target.closest('li').remove()
  event.stopPropagation()
}

const selectList = (event) => {
  if (document.querySelector('.changeInputList') !== null) return

  document.querySelectorAll('.todaytasks').forEach(element => element.classList.remove('current'))
  event.target.closest('li').classList.add('current')

  listsArr.forEach(list => {
    list.listName === event.target.closest('li').textContent ? list.current = true : list.current = false
  })
  document.querySelectorAll('.todo').forEach(todo => todo.remove())
  const index = listsArr.findIndex(list => list.current === true)
  const currentArr = listsArr[index].todos

  currentArr.forEach(todo => createLi(todo.name, todo.complete, todo.id))

  document.querySelector('h1').textContent = document.querySelector('.current').textContent
  localStorage.setItem('lists', JSON.stringify(listsArr))
  noTodos()
}

const createList = (listId, listName, current) => {
  const listItem = document.createElement('li')
  listItem.className = 'todaytasks'
  listItem.id = listId
  listItem.onclick = selectList
  listItem.draggable = true
  listItem.ondragstart = dragStartList
  listItem.ondragenter = dragEnterList
  listItem.ondragleave = dragLeaveList
  listItem.ondragend = onDropList
  listItem.ondragover = onDragoverList
  listItem.onmouseenter = addBlueBackgroundList
  listItem.onmouseleave = removeBlueBackgroundList
  document.querySelector('.lists').append(listItem)
  
  const span = document.createElement('span')
  span.className = 'category_todo'
  span.textContent = listName
  listItem.append(span)

  const imgList = document.createElement('img')
  imgList.className = 'delete'
  imgList.src = 'icons/delete.gif'
  imgList.onclick = removeList
  listItem.append(imgList)
  
  if (current) {
    listItem.classList.add('current')
  }
  noTodos()
}

const removeList = event => {
  const index = listsArr.findIndex(list => list.listName === event.target.parentNode.textContent)
  listsArr.splice(index, 1)

  if (!listsArr.some(list => list.current === true )) {
    listsArr[0].current = true
  }
  
  listsArr.forEach((list, i) => {
    list.listId = 'myList_' + i
  })
  document.querySelectorAll('.todaytasks').forEach((list, i) => {
    list.id = 'myList_' + i
  })  

  localStorage.setItem('lists', JSON.stringify(listsArr))
  
  event.target.closest('li').remove()
  if (![...document.querySelectorAll('.todaytasks')].some(list => list.classList.contains('current'))) {
    document.querySelector('.todaytasks').classList.add('current')
  }
  document.querySelector('h1').textContent = document.querySelector('.current').textContent
  event.stopPropagation()
  noTodos()
}

const dragStartList = event => {
  startItem = event.target.closest('.todaytasks')
  startItem.classList.add('is-dragging')
}

const dragEnterList = event => {
  event.preventDefault()
}

const onDragoverList = event => {
  event.preventDefault()
  createEmptySection()
  mouse = event.clientY

  document.querySelectorAll('.my-todos>li').forEach(todo => {
    todo.style = 'pointer-events:none'
  })
  document.querySelectorAll('.done-todos>li').forEach(todo => {
    todo.style = 'pointer-events:none'
  })
  
  
  if (isAbove(event.target.closest('.todaytasks'))) {
    startItem.parentNode.insertBefore(startItem, event.target.closest('.todaytasks'))
  } else {
    startItem.parentNode.insertBefore(startItem, event.target.closest('.todaytasks').nextSibling)
  }
  document.querySelectorAll('.todaytasks').forEach(todo => {
    todo.classList.remove('hover')
  })
}

const dragLeaveList = event => {
  event.preventDefault()
}

const onDropList = (event) => {

  document.querySelectorAll('.my-todos>li').forEach(todo => {
    todo.style = 'pointer-events:auto'
  })
  document.querySelectorAll('.done-todos>li').forEach(todo => {
    todo.style = 'pointer-events:auto'
  })

  document.querySelectorAll('.todaytasks').forEach(todo => todo.classList.remove('is-dragging'))
  
  listsArr.forEach((list, i) => {
    list.listId = 'myList_' + i
  })
  document.querySelectorAll('.todaytasks').forEach((list, i) => {
    list.id = 'myList_' + i
  })

  const liCollection = [...document.querySelectorAll('.todaytasks')]
  const newListArr = []
  liCollection.forEach((li) => {
    const findedElm = listsArr.find(list => list.listName === li.textContent)
    newListArr.push(findedElm)
  })

  newListArr.forEach((list, i) => {
    list.listId = 'myList_' + i
  })
  noTodos()
  localStorage.setItem('lists', JSON.stringify(newListArr))
}

const showMenu = () => {
  document.querySelector('.dropdown').classList.add('active')
}
document.querySelector('.sortLi').addEventListener("mouseenter", showMenu)

const hideMenu = () => {
  document.querySelector('.dropdown').classList.remove('active')
}
document.querySelector('.dropdown-menu').addEventListener("mouseleave", hideMenu)

const noTodos = () => {
  if (document.querySelectorAll('.my-todos>.todo').length > 0) {
    document.querySelector('.notodos').style = 'display:none'
  } else {
    document.querySelector('.notodos').style = 'display:block'
  }
  if (document.querySelectorAll('.done-todos>.todo').length > 0) {
    document.querySelector('.nodonetodos').style = 'display:none'
  } else {
    document.querySelector('.nodonetodos').style = 'display:block'
  }
}

const addBlueBackground = (event) => {
  event.target.classList.add('hover')
}

const removeBlueBackground = (event) => {
  event.target.classList.remove('hover')
}

const addBlueBackgroundList = (event) => {
  event.target.classList.add('hover')
}

const removeBlueBackgroundList = (event) => {
  event.target.classList.remove('hover')
}

