import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTodos, createTodo } from "./api";
import {
  Box,
  Flex,
  Stack,
  Button,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import TodoItem from "./components/TodoItem";

function App() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [newTodoTitle, setNewTodoTitle] = useState("");

  // Get All todos
  const getTodosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
  });

  // Add a Todo
  const createTodoMutation = useMutation({
    mutationKey: ["add todo"],
    mutationFn: createTodo,
    // refetch the todos query after the mutation succeeds
    onSuccess: () => {
      toast({
        title: "Added successfully",
        variant: "subtle",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  /**
   * Callback run when the user clicks the "Add Todo" button
   */
  const handleAddTodo = (e) => {
    createTodoMutation.mutate({
      title: newTodoTitle,
      completed: false,
    });
    setNewTodoTitle("");
  };

  return (
    <Box padding={"1rem"} maxWidth={"600px"} margin="auto">
      <Stack>
        <Flex>
          <Input
            placeholder="Give it a title"
            marginRight={"10px"}
            flex={1}
            variant="flushed"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
          />
          <Button
            onClick={handleAddTodo}
            colorScheme="green"
            isLoading={createTodoMutation.isPending}
          >
            Add New Todo
          </Button>
        </Flex>
        <br></br>
        <Text align={"center"}>Your Todos</Text>
        <Stack>
          {getTodosQuery.isSuccess && getTodosQuery.data.length > 0 ? (
            getTodosQuery.data.map((todo) => {
              return <TodoItem todo={todo} key={todo.id} />;
            })
          ) : (
            <Box>No Todos Yet!</Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export default App;
