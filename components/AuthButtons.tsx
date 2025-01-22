'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/libs/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'


export function AuthButtons() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()
  
    useEffect(() => {
        const getUser = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
          } catch (error) {
            console.error('Error fetching user:', error)
          } finally {
            setLoading(false)
          }
        }
    
        getUser()
    
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        })
    
        return () => {
          authListener.subscription.unsubscribe()
        }
      }, [supabase])
    
      if (loading) {
        return <Skeleton className="w-[100px] h-10" />
      }
    
      if (user) {
        return (
          <div className="flex items-center">
            <Button asChild>
              <Link href="/dashboard/my-pools">Dashboard</Link>
            </Button>
          </div>
        )
      }
    
      return (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      )
    }
