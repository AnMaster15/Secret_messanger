'use client'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { verifySchema } from '@/schemas/verifySchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const VerifyAccount = () => {
     const router = useRouter()
     const params = useParams<{ username: string }>()
     const { toast } = useToast()
     const [time, setTime] = useState(59)
     const [disable, setDisable] = useState(true)
     const [loading, setLoading] = useState(false)

     useEffect(() => {
          // Function to update the countdown every second
          const intervalId = setInterval(() => {
               setTime((prevTime) => {
                    if (prevTime <= 1) {
                         setDisable(false)
                         clearInterval(intervalId);
                         return 0;
                    }
                    return prevTime - 1;
               });
          }, 1000);
          return () => clearInterval(intervalId);
     }, [])

     const minutes = Math.floor(time / 60);
     const seconds = time % 60;

     const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
     const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

     //zod implementation
     const form = useForm<z.infer<typeof verifySchema>>({
          resolver: zodResolver(verifySchema)
     })

     const { formState } = form;

     const onSubmit = async (data: z.infer<typeof verifySchema>) => {
          try {
               const response = await axios.post('/api/verify-code', {
                    username: params.username,
                    code: data.code
               })

               toast({
                    title: 'Success',
                    description: response.data.message
               })
               router.replace('/sign-in')
          } catch (error) {
               const axiosError = error as AxiosError<ApiResponse>
               toast({
                    title: 'Verification failed',
                    description: axiosError.response?.data.message,
                    variant: 'destructive'
               })
          }
     }

     const handleClick = async () => {
          setLoading(true)
          setDisable(true)
          try {
               const res = await axios.post<ApiResponse>("/api/resend-code", {
                    username: params.username
               })
               if(!res){
                    toast({
                         title: 'Failed to resend verification code',
                         variant: 'destructive'
                    })
               }
               toast({
                    title: 'Verification code resent successfully',
                    description: 'Please check your mail'
               })
          } catch (error) {
               const axiosError = error as AxiosError<ApiResponse>
               toast({
                    title: 'Failed to resend verification code',
                    description: axiosError.response?.data.message,
                    variant: 'destructive'
               })
          } finally {
               setLoading(false)
          }
     }

     return (
          <div className="flex justify-center items-center h-screen overflow-auto bg-gray-100 bg-opacity-50">
               <div className="w-full max-w-lg p-8 space-y-8 bg-white bg-opacity-50 rounded-lg shadow-md">
                    <div className="text-center">
                         <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Verify Your Account</h1>
                         <p className="mb-4">Please check your mail.</p>
                    </div>
                    <Form {...form}>
                         <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
                              <FormField
                                   name="code"
                                   control={form.control}
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Verification Code</FormLabel>
                                             <FormControl>
                                                  <InputOTP maxLength={6} {...field}>
                                                       <InputOTPGroup>
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                            <InputOTPSlot index={2} />
                                                            <InputOTPSlot index={3} />
                                                            <InputOTPSlot index={4} />
                                                            <InputOTPSlot index={5} />
                                                       </InputOTPGroup>
                                                  </InputOTP>
                                             </FormControl>
                                             <FormDescription>
                                                  Please enter the one-time password sent to your email.
                                             </FormDescription>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <Button type="submit" disabled={formState.isSubmitting}>
                                   {
                                        formState.isSubmitting ?
                                             <>
                                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />verifying
                                             </>
                                             : ('Verify')
                                   }
                              </Button>

                              <FormField
                                   name="resend"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormDescription>
                                                  Didn&apos;t receive the code? Please wait {`${formattedMinutes}:${formattedSeconds}`}
                                             </FormDescription>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />

                              <Button type="button" variant={'outline'} onClick={handleClick} disabled={disable}>
                                   {loading? <Loader2 className='h-5 w-5 animate-spin'/> : <>Resend code</>}
                              </Button>
                         </form>
                    </Form>
               </div>
          </div>
     )
}

export default VerifyAccount