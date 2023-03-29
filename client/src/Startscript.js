import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  HStack,
  Switch,
  FormLabel,
  Flex,
  Spacer,
  Input,
  VStack,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { MinusIcon } from "@chakra-ui/icons";

export default function Startscript(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scriptOutput, setScriptOutput] = useState("");
  const [showArguments, setShowArguments] = useState(false);
  const [argumentArray, setArgumentArray] = useState([]);

  function handleShowArgumentsChange(event) {
    formik.resetForm();
    setShowArguments(event.target.checked);
  }

  function handleParameterAdd() {
    setArgumentArray([...argumentArray, { argument: "", value: "" }]);
  }

  function handleParameterRemove(index) {
    const newArgumentArray = [...argumentArray];
    newArgumentArray.splice(index, 1);
    setArgumentArray(newArgumentArray);
  }

  const formik = useFormik({
    initialValues: {},
    onSubmit: (values, { setSubmitting }) => {
      const newObj = {};
      Object.keys(values).forEach((key) => {
        if (key.startsWith("argument")) {
          const argumentIndex = key.replace("argument", "");
          const valueKey = `value${argumentIndex}`;
          newObj[values[key]] = values[valueKey];
        }
      });

      setSubmitting(false);
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          argumentObj: newObj,
          scriptName: props.fileObject.state.selectedFiles[0].name,
        }),
      };

      setLoading(true);
      fetch("/run-script", requestOptions)
        .then((response) => {
          setLoading(false);
          return response.text();
        })
        .then((data) => {
          setScriptOutput(data);
        })
        .catch((error) => {
          setLoading(false);
          console.log(error.response);
        });
    },
  });

  useEffect(() => {
    setShowArguments(false);
    setScriptOutput("");
    setArgumentArray([]);
    formik.resetForm();
    if (props.fileObject?.id === "runscript") {
      setShowModal(true);
      onOpen();
    } else {
      setShowModal(false);
      onClose();
    }
  }, [props]);

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} size="6xl">
      {showModal && <ModalOverlay backdropBlur="2px" />}
      <ModalContent>
        <Flex alignItems="center">
          <ModalHeader flex="2">
            👉Click Start Script if no arguments are needed👈
          </ModalHeader>
          <Spacer />
          <Flex mr="12" pb="3" mt="3" alignItems="center">
            <FormLabel pt="2" htmlFor="arguments">
              Add Arguments ?
            </FormLabel>
            <Switch
              id="arguments"
              colorScheme="teal"
              checked={showArguments}
              onChange={handleShowArgumentsChange}
            />
          </Flex>
        </Flex>
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            <VStack>
              {showArguments && (
                <VStack>
                  {argumentArray.map((argument, index) => (
                    <HStack key={index + 1}>
                      <Input
                        placeholder={`--example${index + 1}`}
                        color="black"
                        type="text"
                        name={`argument${index}`}
                        defaultValue={formik.values[`argument${index}`]}
                        onChange={formik.handleChange}
                      />
                      <Input
                        placeholder={`Value ${index + 1}`}
                        color="black"
                        type="text"
                        name={`value${index}`}
                        defaultValue={formik.values[`value${index}`]}
                        onChange={formik.handleChange}
                      />

                      <IconButton
                        aria-label="remove"
                        ml="2"
                        pt="1"
                        colorScheme="red"
                        size="sm"
                        icon={<MinusIcon />}
                        onClick={() => handleParameterRemove(index)}
                      />
                    </HStack>
                  ))}
                  <Button
                    borderRadius="full"
                    aria-label="add"
                    mt="2"
                    mb="4"
                    colorScheme="teal"
                    onClick={handleParameterAdd}
                  >
                    Add Argument
                  </Button>
                </VStack>
              )}
              <Textarea
                color="black"
                placeholder="Script Results"
                // bg="gray.800"
                colorScheme=""
                defaultValue={scriptOutput}
                my={4}
                size="md"
                maxWidth="3xl"
                variant="filled"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="yellow"
              borderRadius="full"
              mr={3}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              borderRadius="full"
              type="submit"
              colorScheme="teal"
              isLoading={formik.isSubmitting || loading}
            >
              {loading ? "Running..." : "Start Script"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
