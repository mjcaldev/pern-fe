import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb"
import { CreateView } from "@/components/refine-ui/views/create-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useBack } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { classSchema } from "@/lib/schema";
import * as z from "zod";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const create = () => {
  const back = useBack();

  const form = useForm({
    resolver: zodResolver(classSchema),
    refineCoreProps: {
      resource: "classes",
      action: "create",
    },
    defaultValues: {
      username: "",
    },
  });

  const { handleSubmit, formState: {isSubmitting, control}} = form;

  const onSubmit = (values: z.infer<typeof classSchema>) => {
    try {
      console.log(values);
    } catch (e){
      console.log('Error creating new classes',e);
    }
  }

  const teachers = [
    { id: 1, name: "John Smith" },
    { id: 2, name: "Jane Doe" },
    { id: 3, name: "Robert Johnson" },
    { id: 4, name: "Emily Williams" },
    { id: 5, name: "Michael Brown" },
  ];

  const subjects = [
    { id: 1, name: "Mathematics", code: "MATH" },
    { id: 2, name: "Science", code: "SCI" },
    { id: 3, name: "English", code: "ENG" },
    { id: 4, name: "History", code: "HIST" },
    { id: 5, name: "Geography", code: "GEO" },
  ];

  return (
    <CreateView className="class-view"> 
      <Breadcrumb />

      <h1 className="page-title">Create a Class</h1>

      <div className="intro-row">
        <p>Proivde the required information to create a class.</p>
        <Button onClick={back}>Go Back</Button>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold">
              Fill out this form to create a class
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
          <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-3">
           <Label>
            Banner Image <span className="text-orange-600">*</span>
           </Label>

           <p>Upload Image Widget</p>
        </div>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name <span className="text-orange-600">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter Class Name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
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
              <FormLabel>Subject <span className="text-orange-600">*</span></FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field?.value?.toString()}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher <span className="text-orange-600">*</span></FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field?.value?.toString()}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
          </CardContent>

        </Card>
      </div>
    </CreateView>
  )
}

export default create