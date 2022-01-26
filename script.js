const cancel = document.getElementById('button-cancel')
const NewTransaction = document.querySelector('.newButton')
const modal = document.querySelector('.modal-overlay')

const NoActive = () => {
  modal.classList.remove('active')
}
const Active = () => {
  modal.classList.add('active')
}
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances')) || []
  },

  set(transactions) {
    localStorage.setItem('dev.finances', JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach(tc => {
      if (tc.amount > 0) {
        income = income + tc.amount
      }
    })
    return income
  },
  expenses() {
    let expense = 0
    Transaction.all.forEach(tc => {
      if (tc.amount < 0) {
        expense = expense + tc.amount
      }
    })
    return expense
  },
  total() {
    let total = Transaction.incomes() + Transaction.expenses()
    return total
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction)
    tr.setIndex = index
    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSValue = transaction.amount > 0 ? 'income' : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = ` 
        <td class="description">${transaction.description}</td>
        <td class="${CSSValue}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td><img onclick ="Transaction.remove(${index})" src="assets/minus.svg" alt="Excluir linha" /></td>
    `
    return html
  },
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    )
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    )
    document.getElementById('TotalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    )
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''
    value = String(value).replace(/\D/g, '')
    value = value / 100
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return signal + value
  },
  formatAmount(value) {
    value = Number(value) * 100
    return value
  },
  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }
}

const Form = {
  description: document.querySelector('#description'),
  amount: document.querySelector('#amount'),
  date: document.querySelector('#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields() {
    const { description, amount, date } = Form.getValues()
    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Preencha todos os campos')
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    return {
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction) {
    Transaction.add(transaction)
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()
    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Form.saveTransaction(transaction)
      Form.clearFields()
      NoActive()
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction)
    DOM.updateBalance()
    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()

Transaction.remove(0)

cancel.addEventListener('click', NoActive)
NewTransaction.addEventListener('click', Active)
