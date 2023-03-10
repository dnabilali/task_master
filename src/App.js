import { React, useState, useEffect } from "react";
import { db } from "./firebase-config";
import { query, orderBy } from "firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import AddTaskForm from "./addTaskForm";
import UpdateTaskForm from "./updateTask";
import TasksTable from "./components/tasksTable";
import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  TableContainer,
  Select,
  Flex,
  Text,
  Badge,
} from "@chakra-ui/react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [overdueTasksNum, setOverdueTasksNum] = useState(0);

  const [sortBy, setSortBy] = useState("due date");

  const onSortByChange = (event) => {
    setSortBy(event.target.value);
    if (event.target.value === "due date") {
      sortByDueDate();
    } else if (event.target.value === "name") {
      sortByName();
    } else if (event.target.value === "time to complete") {
      sortByTimeToComplete();
    } else {
      sortByStatus();
    }
  };

  const sortByDueDate = () => {
    const allTasks = [...tasks];
    allTasks.sort((a, b) => a.due_date - b.due_date);
    setTasks(allTasks);
  };

  const sortByName = () => {
    const allTasks = [...tasks];
    allTasks.sort((a, b) => a.name.localeCompare(b.name));
    setTasks(allTasks);
  };

  const sortByTimeToComplete = () => {
    const allTasks = [...tasks];
    allTasks.sort((a, b) => a.time_to_complete - b.time_to_complete);
    setTasks(allTasks);
  };

  const sortByStatus = () => {
    const allTasks = [...tasks];
    allTasks.sort((a, b) => a.status.localeCompare(b.status));
    setTasks(allTasks);
  };

  const user1TasksCollectionRef = collection(
    db,
    "users/6cVRBwcwJzOUOBIcVDOQ/tasks"
  );
  const usersCollectionRef = collection(db, "users");

  const getAllTasksUser1 = () => {
    getDocs(query(user1TasksCollectionRef, orderBy("due_date"))).then(
      (tasks) => {
        setTasks(tasks.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      }
    );
  };

  const getAllUsers = () => {
    getDocs(usersCollectionRef).then((users) => {
      setUsers(users.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  };

  useEffect(() => {
    getAllTasksUser1();
    getAllUsers();
    console.log({ allUsers: users });
  }, []);

  useEffect(() => {
    countOverdueTasks();
  }, [tasks]);

  const countOverdueTasks = () => {
    var tempOverdueNum = 0;
    for (const task of tasks) {
      console.log(task.due_date.toDate().toISOString().slice(0, 10));
      const taskDueDate = task.due_date.toDate().toISOString().slice(0, 10);
      const todayDate = new Date().toISOString().slice(0, 10);
      if (taskDueDate < todayDate && task.status !== "completed") {
        tempOverdueNum++;
      }
    }
    setOverdueTasksNum(tempOverdueNum);
  };

  const addTask = async (newTask) => {
    await addDoc(user1TasksCollectionRef, {
      description: newTask.description,
      due_date: new Date(newTask.due_date),
      name: newTask.name,
      status: newTask.status,
      time_to_complete: newTask.time_to_complete,
    });
    getAllTasksUser1();
  };

  const deleteTask = async (toDeleteTask) => {
    console.log(toDeleteTask.id);
    const docref = doc(db, `users/6cVRBwcwJzOUOBIcVDOQ/tasks/${toDeleteTask}`);
    await deleteDoc(docref);
    getAllTasksUser1();
  };

  const updateTask = async (taskId, newTask) => {
    console.log(taskId);
    const taskDoc = doc(db, `users/6cVRBwcwJzOUOBIcVDOQ/tasks/${taskId}`);
    const newFields = {
      description: newTask.description,
      due_date: new Date(newTask.due_date),
      name: newTask.name,
      status: newTask.status,
      time_to_complete: newTask.time_to_complete,
    };
    await updateDoc(taskDoc, newFields);
    getAllTasksUser1();
  };

  return (
    <Box m="20" boxShadow="xl" rounded="md" p="10">
      <Flex align="center" mb={4}>
        <Text fontSize="md" fontWeight="medium" mr={2}>
          {users[0] ? <h1>Hello, {users[0].name}!</h1> : <h1>Hello!</h1>}
        </Text>

        {overdueTasksNum === 0 ? (
          <Text>You're all caught up!</Text>
        ) : (
          <Badge colorScheme="red">
            You have {overdueTasksNum} overdue task(s)!
          </Badge>
        )}
      </Flex>

      <Text
        fontSize="xl"
        fontWeight="bold"
        m={8}
        borderBottom="solid 6px #1da1f2"
      >
        My Tasks
      </Text>

      <main>
        <Flex w="60" align="center">
          <Text whiteSpace="nowrap" mr={4}>
            Sort By:
          </Text>
          <Select aria-label="Sort By" onChange={onSortByChange} value={sortBy}>
            <option value="due date" selected>
              due date
            </option>
            <option value="name">name</option>
            <option value="status">status</option>
          </Select>
        </Flex>

        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Due Date</Th>
                <Th>Time To Complete</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <TasksTable allTasks={tasks} deleteCallBack={deleteTask} />
          </Table>
        </TableContainer>
        <AddTaskForm addTaskCallBack={addTask}></AddTaskForm>
        <div>
          <UpdateTaskForm updateTaskCallBack={updateTask}></UpdateTaskForm>
        </div>
      </main>
    </Box>
  );
}

export default App;
