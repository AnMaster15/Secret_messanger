/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const page = () => {
     const [username, setUsername] = useState('')
     const [usernameMessage, setUsernameMessage] = useState('')
     const [isCheckingUsername, setIsCheckingUsername] = useState(false)

     const debounced = useDebounceCallback(setUsername, 300)
     const { toast } = useToast()
     const router = useRouter()

     //zod implementation
     const form = useForm<z.infer<typeof signUpSchema>>({
          resolver: zodResolver(signUpSchema),
          defaultValues: {
               username: '',
               email: '',
               password: ''
          }
     })

     const { formState } = form;


     useEffect(() => {
          const checkUsernameUnique = async () => {
               if (username) {
                    setIsCheckingUsername(true)
                    setUsernameMessage('')
                    try {
                         const response = await axios.get(`/api/check-username-unique?username=${username}`)
                         console.log(response)
                         setUsernameMessage(response.data.message)
                    } catch (error) {
                         const axiosError = error as AxiosError<ApiResponse>
                         setUsernameMessage(axiosError.response?.data.message || "Error checking username")
                    } finally {
                         setIsCheckingUsername(false)
                    }
               }
          }
          checkUsernameUnique()
     }, [username])

     const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
          try {
               const response = await axios.post<ApiResponse>('/api/sign-up', data)
               toast({
                    title: 'Success',
                    description: response.data.message
               })
               router.replace(`/verify/${username}`)
          } catch (error) {
               console.error('Error in sign-up of user', error)
               const axiosError = error as AxiosError<ApiResponse>
               let errorMessage = axiosError.response?.data.message
               toast({
                    title: 'Sign-up failed.',
                    description: errorMessage,
                    variant: 'destructive'
               })

          }
     }

     return (
          <div className="flex justify-center items-center min-h-screen bg-gray-100">
               <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
                    <div className="text-center">
                         <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join Insight-Sphere</h1>
                         <p className="mb-4">Sign-up to start your anonymous adventure.</p>
                    </div>
                    <Form {...form}>
                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                              <FormField
                                   name="username"
                                   control={form.control}
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Username</FormLabel>
                                             <FormControl>
                                                  <Input placeholder="username" {...field} onChange={(e) => {
                                                       field.onChange(e)
                                                       debounced(e.target.value)
                                                  }} />
                                             </FormControl>
                                             {isCheckingUsername && <Loader2 className="animate-spin" />}
                                             <p className={`text-sm ${usernameMessage === 'Valid username' ? 'text-green-600' : 'text-red-600'}`}>
                                                  {usernameMessage}
                                             </p>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   name="email"
                                   control={form.control}
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Email</FormLabel>
                                             <FormControl>
                                                  <Input type="email" placeholder="email" {...field} />
                                             </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   name="password"
                                   control={form.control}
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Password</FormLabel>
                                             <FormControl>
                                                  <Input type="password" placeholder="password" {...field} />
                                             </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <Button type="submit" disabled={formState.isSubmitting}>
                                   {
                                        formState.isSubmitting ?
                                             <>
                                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing up
                                             </>
                                             : ('Sign up')
                                   }
                              </Button>
                         </form>
                    </Form>
                    <div className="text-center mt-4">
                         <p>Already a member?{'  '}
                              <Link href={'/sign-in'} className="text-blue-600 hover:text-blue-800">Sign-in</Link>
                         </p>
                    </div>
               </div>
          </div>
     );
}

export default page