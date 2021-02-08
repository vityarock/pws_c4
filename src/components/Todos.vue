<template>
  <div class="container">
    <div class="col-sm-10">
      <h1>Задачи</h1>

      <confirmation
        :message="message"
        :alertType="alertType"
        v-if="showConfirmation"
        >
      </confirmation>

      <div class="d-flex justify-content-between align-items-end">
        <button type="button"
              id="task-add"
              class="btn btn-success text-left"
              v-b-modal.todo-modal
              @click="modalUpdate=false">
        Добавить задачу
        </button>
        &nbsp;
        <div class="text-right mb-20">
          <b-button variant="primary">
           В работе <b-badge variant="light">{{ todos.length - todosCount }}</b-badge>
          </b-button>
          <b-button variant="primary">
           Завершено <b-badge variant="light">{{ todosCount }}</b-badge>
          </b-button>
        </div>
      </div>
      <table class="table table-dark table-stripped table-hover">
        <thead class="thead-light">
          <tr>
            <th>Uid</th>
            <th>Описание</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(todo, index) in todos" :key="index">
            <td class="todo-uid">{{ todo.uid }}</td>
            <td>{{ todo.description }}</td>
            <td>
              <span v-if="todo.is_completed">Завершено</span>
              <span v-else>В работе</span>
            </td>
            <td>
              <div class="btn-group" role="group">
                <button type="button"
                  class="btn btn-secondary btn-sm"
                  v-b-modal.todo-modal
                  @click="updateTodo(todo)"
                  >Обновить
                </button>
                &nbsp;
                <button type="button"
                  class="btn btn-danger btn-sm"
                  @click="deleteTodo(todo)">
                  X
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

    <b-modal ref="todoModal"
         id="todo-modal"
         :title="modalName"
         hide-footer>
      <b-form @submit="onSubmit" @reset="onReset" class="w-100">
        <b-form-group id="form-description-group"
                  label="Описание:"
                  label-for="form-description-input">
          <b-form-input id="form-description-input"
                    type="text"
                    v-model="todoForm.description"
                    required
                    placeholder="Завести задачу">
          </b-form-input>
        </b-form-group>
        <b-form-group id="form-complete-group">
          <b-form-checkbox-group v-model="todoForm.is_completed" id="form-checks">
            <b-form-checkbox value="true">Задача выполнена?</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-button type="submit" variant="primary">{{ modalName }}</b-button>
        <b-button type="reset" variant="danger">Сброс</b-button>
      </b-form>
    </b-modal>
    </div>
  </div>
</template>

<style>
button#task-add {
  margin-top: 20px;
  margin-bottom: 20px;
}
h1, td {
  text-align: left;
}
.todo-uid {
  text-align: right;
}
</style>

<script>
/* eslint no-restricted-syntax: ["off", "ForOfStatement"] */
import axios from 'axios';
import Confirmation from './Confirmation.vue';

const dataURL = 'http://localhost:5000/api/tasks/';

export default {
  name: 'Todo',
  data() {
    return {
      todos: [],
      todoForm: {
        uid: 0,
        description: '',
        is_completed: [],
      },
      message: '',
      alertType: 'warning',
      showConfirmation: false,
      modalUpdate: true,
    };
  },

  updated() {
    if (this.message !== undefined && this.message !== '') {
      this.showConfirmation = true;
    }
  },
  computed: {
    modalName() {
      if (this.modalUpdate !== true) {
        return 'Добавить задачу';
      }
      return 'Обновить задачу';
    },

    todosCount() {
      let completeCounter = 0;
      for (const value of Object.values(this.todos)) {
        if (value.is_completed === true) {
          completeCounter += 1;
        }
      }
      return completeCounter;
    },
  },
  methods: {
    getTodos() {
      axios.get(dataURL)
        .then((response) => {
          this.todos = response.data.tasks;
          localStorage.setItem('todos', JSON.stringify(this.todos));
        }).catch(() => {
          this.alertType = 'warning';
          this.message = 'База данных недоступна. Проверьте соединение с сервером.';
        });
    },

    resetForm() {
      this.todoForm.description = '';
      this.todoForm.is_completed = [];
    },

    onSubmit(event) {
      event.preventDefault();
      this.$refs.todoModal.hide();
      const requestData = {
        description: this.todoForm.description,
        is_completed: this.todoForm.is_completed.length > 0,
      };
      if (this.modalUpdate !== true) {
        axios.post(dataURL, requestData)
          .then(() => {
            this.getTodos();
            this.alertType = 'success';
            this.message = `Задача "${requestData.description}" добавлена`;
          })
          .catch(() => {
            this.alertType = 'warning';
            this.message = 'База данных недоступна. Проверьте соединение с сервером и повторите отправку данных.';
          })
          .finally(() => {
            this.resetForm();
          });
      } else {
        const todoURL = dataURL + this.todoForm.uid;
        axios.put(todoURL, requestData)
          .then(() => {
            this.getTodos();
            this.alertType = 'info';
            this.message = `Задача "${this.todoForm.description}" обновлена`;
            // this.showConfirmation = true;
          })
          .catch(() => {
            this.alertType = 'warning';
            this.message = 'База данных недоступна. Проверьте соединение с сервером и повторите отправку данных.';
          })
          .finally(() => {
            this.resetForm();
          });
      }
    },

    onReset(event) {
      event.preventDefault();
      this.$refs.todoModal.hide();
      this.resetForm();
    },

    updateTodo(todo) {
      this.modalUpdate = true;
      this.todoForm = todo;
    },

    deleteTodo(todo) {
      const todoURL = dataURL + todo.uid;
      this.alertType = 'warning';
      this.message = `Задача "${todo.description}" удалена`;
      axios.delete(todoURL)
        .then(() => {
          this.getTodos();
          this.showConfirmation = true;
        })
        .catch(() => {
          this.alertType = 'warning';
          this.message = 'База данных недоступна. Проверьте соединение с сервером и повторите отправку данных.';
        });
    },

    onUpdateReset(event) {
      event.preventDefault();
      this.$refs.todoModal.hide();
      this.resetForm();
    },
  },

  components: {
    confirmation: Confirmation,
  },

  created() {
    const LS = localStorage.getItem('todos');
    if (LS == null || LS === []) {
      this.getTodos();
    } else {
      this.todos = JSON.parse(LS);
      const syncURL = 'http://localhost:5000/api/tasks/sync';
      axios.post(syncURL, this.todos)
        .then(() => {
          this.getTodos();
          this.alertType = 'success';
          this.message = 'синхронизация выполнена';
        })
        .catch(() => {
          this.alertType = 'warning';
          this.message = 'База данных недоступна. Проверьте соединение с сервером.';
        });
    }
  },
};
</script>
