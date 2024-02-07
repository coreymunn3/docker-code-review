import axios from "axios";

const baseUrl = "localhost";

export const getTodos = async () => {
  const res = axios.get(`http://${baseUrl}:5000/api/todo`);
  return res;
};

export const createTodo = async (newTodo) => {
  await axios.post(`http://${baseUrl}:5000/api/todo`, newTodo);
};

export const editTodo = async (todo) => {
  await axios.put(`http://${baseUrl}:5000/api/todo/${todo.id}`, todo);
};

export const deleteTodo = async (id) => {
  await axios.delete(`http://${baseUrl}:5000/api/todo/${id}`);
};

export const reorderTodo = async (args) => {
  const { id, direction } = args;
  await axios.put(`http://${baseUrl}:5000/api/todo/${id}/${direction}`, {});
};
