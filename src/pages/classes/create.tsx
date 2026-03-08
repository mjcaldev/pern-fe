import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

import { Textarea } from "@/components/ui/textarea";
import { useBack, useList } from "@refinedev/core";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { classSchema } from "@/lib/schema";
import UploadWidget from "@/components/upload-widget";
import type { UploadWidgetValue } from "@/types";
import { Subject, User } from "@/types";
import z from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function getQueryErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || "Unknown error";
  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    const msg = e.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    const status = e.statusCode;
    if (typeof status === "number") return `Request failed (${status})`;
  }
  return "Unknown error";
}

type ComboboxOption = { value: string; label: string; keywords?: string[] };

function FormCombobox({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !selected?.label && "text-muted-foreground"
          )}
          aria-expanded={open}
          role="combobox"
        >
          <span
            className="truncate"
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  keywords={opt.keywords ?? opt.label.split(" ")}
                  onSelect={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const create = () => {
  const back = useBack();

  const form = useForm({
    resolver: zodResolver(classSchema),
    refineCoreProps: {
      resource: "classes",
      action: "create",
    },
    defaultValues: {
      status: "active",
    },
  });

  const {
    refineCore: { onFinish },
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = form;

  const bannerPublicId = form.watch("bannerCldPubId");

  const setBannerImage = (file: UploadWidgetValue | null, field: { onChange: (value: string) => void }) => {
    if (file) {
      field.onChange(file.url);
      form.setValue("bannerCldPubId", file.publicId, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } else {
      field.onChange('');
      form.setValue('bannerCldPubId', '', {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  const onSubmit = async (values: z.infer<typeof classSchema>) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  // Fetch subjects list
  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: {
      pageSize: 100,
    },
  });

  // Fetch teachers list
  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "teacher",
      },
    ],
    pagination: {
      pageSize: 100,
    },
  });

  const teachers = teachersQuery.data?.data || [];
  const teachersLoading = teachersQuery.isLoading;

  const subjects = subjectsQuery.data?.data || [];
  const subjectsLoading = subjectsQuery.isLoading;

  const subjectsLoadError =
    (subjectsQuery as any)?.isError && getQueryErrorMessage(subjectsQuery.error);
  const teachersLoadError =
    (teachersQuery as any)?.isError && getQueryErrorMessage(teachersQuery.error);

  useEffect(() => {
    if ((subjectsQuery as any)?.isError) {
      console.error("[CreateClass] Failed to load subjects:", subjectsQuery.error);
    }
  }, [(subjectsQuery as any)?.isError, subjectsQuery.error]);

  useEffect(() => {
    if ((teachersQuery as any)?.isError) {
      console.error("[CreateClass] Failed to load teachers:", teachersQuery.error);
    }
  }, [(teachersQuery as any)?.isError, teachersQuery.error]);

  return (
    <CreateView className="class-view">
      <Breadcrumb />

      <h1 className="page-title">Create a Class</h1>
      <div className="intro-row">
        <p>Provide the required information below to add a class.</p>
        <Button onClick={() => back()}>Go Back</Button>
      </div>

      <Separator />

      <div className="my-4 w-full px-4 sm:px-6 lg:px-10">
        <Card className="class-form-card mx-auto w-full max-w-4xl lg:max-w-5xl">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
              Fill out form
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={control}
                  name="bannerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Banner Image <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <UploadWidget
                          value={
                            field.value
                              ? {
                                  url: field.value,
                                  publicId: bannerPublicId ?? "",
                                }
                              : null
                          }
                          onChange={(file: any) => setBannerImage(file, field)}
                          />
                      </FormControl>
                      <FormMessage />
                      {errors.bannerCldPubId && !errors.bannerUrl && (
                        <p className="text-destructive text-sm">
                          {errors.bannerCldPubId.message?.toString()}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Class Name <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Introduction to Biology - Section A"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Subject <span className="text-orange-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <FormCombobox
                            value={
                              field.value !== undefined && field.value !== null
                                ? String(field.value)
                                : ""
                            }
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            options={subjects.map((s) => ({
                              value: String(s.id),
                              label: `${s.name} (${s.code})`,
                              keywords: [s.name, s.code],
                            }))}
                            placeholder={
                              subjectsLoading
                                ? "Loading subjects..."
                                : subjectsLoadError
                                ? "Failed to load subjects"
                                : "Select a subject"
                            }
                            disabled={subjectsLoading || !!subjectsLoadError}
                            searchPlaceholder="Search subjects..."
                            emptyText={
                              subjectsLoadError
                                ? `Failed to load subjects${subjectsLoadError ? `: ${subjectsLoadError}` : ""}`
                                : "No subjects found."
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        {subjectsLoadError && (
                          <p className="text-destructive text-sm">
                            {subjectsLoadError}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Teacher <span className="text-orange-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <FormCombobox
                            value={field.value ? String(field.value) : ""}
                            onValueChange={field.onChange}
                            options={teachers.map((t) => ({
                              value: t.id,
                              label: t.name,
                              keywords: [t.name, t.email ?? ""].filter(Boolean),
                            }))}
                            placeholder={
                              teachersLoading
                                ? "Loading teachers..."
                                : teachersLoadError
                                ? "Failed to load teachers"
                                : "Select a teacher"
                            }
                            disabled={teachersLoading || !!teachersLoadError}
                            searchPlaceholder="Search teachers..."
                            emptyText={
                              teachersLoadError
                                ? `Failed to load teachers${teachersLoadError ? `: ${teachersLoadError}` : ""}`
                                : "No teachers found."
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        {teachersLoadError && (
                          <p className="text-destructive text-sm">
                            {teachersLoadError}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Capacity <span className="text-orange-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="30"
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? Number(value) : undefined);
                            }}
                            value={(field.value as number | undefined) ?? ""}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Status <span className="text-orange-600">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description about the class"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <Button type="submit" size="lg" className="w-full">
                  {isSubmitting ? (
                    <div className="flex gap-1">
                      <span>Creating Class...</span>
                      <Loader2 className="inline-block ml-2 animate-spin" />
                    </div>
                  ) : (
                    "Create Class"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

export default create