"use client";

import type { CardProps, SwitchProps } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
  Input,
  extendVariants,
  Switch,
  cn,
  Listbox,
  ListboxItem,
  ScrollShadow,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { listApiKeys, setApiKey, getApiKey, deleteApiKey } from "../../utils/api";
import { useTheme } from "next-themes";

// CellWrapper Component
const CellWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2 rounded-medium bg-content2 p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

CellWrapper.displayName = "CellWrapper";

// CustomSwitch Component
const CustomSwitch = extendVariants(Switch, {
  variants: {
    color: {
      foreground: {
        wrapper: [
          "group-data-[selected=true]:bg-foreground",
          "group-data-[selected=true]:text-background",
        ],
      },
    },
  },
});

// SwitchCell Component
type SwitchCellProps = Omit<SwitchProps, "color"> & {
  label: string;
  description: string;
  color?: SwitchProps["color"] | "foreground";
  classNames?: SwitchProps["classNames"] & {
    description?: string | string[];
  };
};

const SwitchCell = React.forwardRef<HTMLInputElement, SwitchCellProps>(
  ({ label, description, classNames, ...props }, ref) => (
    <CustomSwitch
      ref={ref}
      classNames={{
        ...classNames,
        base: cn(
          "inline-flex bg-content2 flex-row-reverse w-full max-w-full items-center",
          "justify-between cursor-pointer rounded-medium gap-2 p-4",
          classNames?.base,
        ),
      }}
      {...props}
    >
      <div className="flex flex-col">
        <p className={cn("text-medium", classNames?.label)}>{label}</p>
        <p className={cn("text-small text-default-500", classNames?.description)}>{description}</p>
      </div>
    </CustomSwitch>
  ),
);

SwitchCell.displayName = "SwitchCell";

// APIKeys Component
function APIKeys(props: CardProps) {
  const [keys, setKeys] = useState<{ name: string; value: string }[]>([]);
  const [originalKeys, setOriginalKeys] = useState<{ name: string; value: string }[]>([]);

  const fetchApiKeys = async () => {
    try {
      const keys = await listApiKeys();
      const keyValues = await Promise.all(
        keys.map(async (key: string) => {
          const value = await getApiKey(key);
          return { name: value.name, value: value.value };
        })
      );

      setKeys(keyValues);
      setOriginalKeys(keyValues);
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys((prevKeys) =>
      prevKeys.map((key) =>
        key.name === name ? { ...key, value: value } : key
      )
    );
  };

  const handleDeleteKey = async (name: string) => {
    try {
      await deleteApiKey(name);
      await fetchApiKeys(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting API key:", error);
    }
  };

  const saveApiKeys = async () => {
    try {
      await Promise.all(
        keys.map(async ({ name, value }) => {
          const originalKey = originalKeys.find(k => k.name === name);
          const trimmedValue = value.trim();

          // If we have a non-empty value, set it
          if (trimmedValue !== '') {
            await setApiKey(name, trimmedValue);
          }
          // Only delete if the key previously existed and now we're clearing it
          else if (originalKey && originalKey.value !== '') {
            await handleDeleteKey(name);
          }
        })
      );
      await fetchApiKeys(); // Refresh the list after saving
    } catch (error) {
      console.error("Error saving API keys:", error);
    }
  };

  const hasChanges = () => {
    return keys.some((key, index) => key.value !== originalKeys[index].value);
  };

  return (
    <Card className="max-w-xl p-2" {...props}>
      <CardBody className="grid grid-cols-1 gap-4">
        {keys.map(({ name, value }) => (
          <Input
            key={name}
            label={name}
            labelPlacement="outside"
            placeholder={`Enter value`}
            name={name}
            value={value}
            onFocus={() => setKeys((prevKeys) =>
              prevKeys.map((key) =>
                key.name === name ? { ...key, value: '' } : key
              )
            )}
            onChange={handleInputChange}
            endContent={
              <Button
                isIconOnly
                variant="light"
                onPress={() => handleDeleteKey(name)}
              >
                <Icon icon="solar:trash-bin-trash-bold" className="text-danger" width={20} />
              </Button>
            }
          />
        ))}
      </CardBody>
      {hasChanges() && (
        <CardFooter className="flex justify-between">
          <Button
            onPress={saveApiKeys}
            className="bg-primary text-white"
          >
            Save API Keys
          </Button>
          <Button
            onPress={() => setKeys(originalKeys)}
            className="bg-secondary text-primary"
          >
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Add Ollama Models type and data
const ollamaModels = [
  {
    id: "llama3.3",
    name: "Llama 3 (8B)",
    description: "Latest Llama 3 model (8B parameters)",
    installed: false,
  },
  {
    id: "llama3.2",
    name: "Llama 3.2 (8B)",
    description: "Llama 3.2 model (8B parameters)",
    installed: false,
  },
  {
    id: "llama3.2-1b",
    name: "Llama 3.2 (1B)",
    description: "Lightweight Llama 3.2 model (1B parameters)",
    installed: false,
  },
  {
    id: "gemma2",
    name: "Gemma 2",
    description: "Google's Gemma 2 model",
    installed: false,
  },
  {
    id: "gemma2-2b",
    name: "Gemma 2 (2B)",
    description: "Lightweight Gemma 2 model (2B parameters)",
    installed: false,
  },
  {
    id: "mistral",
    name: "Mistral",
    description: "Mistral base model",
    installed: false,
  },
  {
    id: "codellama",
    name: "CodeLlama",
    description: "Specialized model for code generation",
    installed: false,
  },
  {
    id: "mixtral",
    name: "Mixtral 8x7B",
    description: "Mixtral 8x7B instruction model",
    installed: false,
  },
];

// Add OllamaModels Component
function OllamaModels(props: CardProps) {
  const [selectedModels, setSelectedModels] = React.useState(new Set<string>([]));
  const [isOllamaEnabled, setIsOllamaEnabled] = React.useState(false);

  const arrayValues = Array.from(selectedModels);

  const topContent = React.useMemo(() => {
    if (!arrayValues.length) {
      return null;
    }

    return (
      <ScrollShadow
        hideScrollBar
        className="w-full flex py-0.5 px-2 gap-1"
        orientation="horizontal"
      >
        {arrayValues.map((value) => (
          <Chip key={value}>
            {ollamaModels.find((model) => model.id === value)?.name}
          </Chip>
        ))}
      </ScrollShadow>
    );
  }, [arrayValues]);

  return (
    <Card className="max-w-xl p-2" {...props}>
      <CardBody className="grid grid-cols-1 gap-4">
        <SwitchCell
          label="Enable Ollama"
          description="Enable Ollama local model support"
          isSelected={isOllamaEnabled}
          onValueChange={setIsOllamaEnabled}
        />

        {isOllamaEnabled && (
          <div className="w-full border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
            <Listbox
              classNames={{
                base: "max-w-full",
                list: "max-h-[300px] overflow-scroll",
              }}
              items={ollamaModels}
              label="Select models to install"
              selectionMode="multiple"
              topContent={topContent}
              variant="flat"
              onSelectionChange={setSelectedModels}
            >
              {(item) => (
                <ListboxItem key={item.id} textValue={item.name}>
                  <div className="flex flex-col">
                    <span className="text-small">{item.name}</span>
                    <span className="text-tiny text-default-400">
                      {item.description}
                    </span>
                  </div>
                </ListboxItem>
              )}
            </Listbox>
          </div>
        )}
      </CardBody>
      {isOllamaEnabled && arrayValues.length > 0 && (
        <CardFooter>
          <Button
            className="bg-primary text-white"
            onPress={() => {
              // TODO: Implement model installation
              console.log("Installing models:", arrayValues);
            }}
          >
            Install Selected Models
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Main SettingsModal Component
export default function SettingsModal(props: CardProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <Button onPress={onOpen} variant="light" isIconOnly>
        <Icon className="text-default-500" icon="solar:settings-linear" width={24} />
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
              <ModalBody>
                <Card {...props}>
                  <Tabs
                    classNames={{
                      tabList: "mx-4 mt-6 text-medium",
                      tabContent: "text-small",
                    }}
                    size="lg"
                  >
                    <Tab
                      key="appearance"
                      textValue="Appearance"
                      title={
                        <div className="flex items-center gap-1.5">
                          <Icon icon="solar:palette-bold" width={20} />
                          <p>Appearance</p>
                        </div>
                      }
                    >
                      <div className="p-4">
                        <SwitchCell
                          label="Dark Mode"
                          description="Toggle between light and dark theme"
                          isSelected={theme === 'dark'}
                          onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
                        />
                      </div>
                    </Tab>
                    <Tab
                      key="api-keys"
                      textValue="API Keys"
                      title={
                        <div className="flex items-center gap-1.5">
                          <Icon icon="solar:user-id-bold" width={20} />
                          <p>API Keys</p>
                        </div>
                      }
                    >
                      <APIKeys className="p-2 shadow-none" />
                    </Tab>
                    <Tab
                      key="ollama"
                      textValue="Ollama"
                      title={
                        <div className="flex items-center gap-1.5">
                          <Icon icon="solar:server-bold" width={20} />
                          <p>Ollama</p>
                        </div>
                      }
                    >
                      <OllamaModels className="p-2 shadow-none" />
                    </Tab>
                  </Tabs>
                </Card>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
