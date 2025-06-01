"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, CreditCard, DollarSign, Calendar, CheckCircle2, User, Mail, IdCard, Lock, Shield, GraduationCap } from "lucide-react"
import Link from "next/link"

const MEMBERSHIP_PRICES = {
  '1-trimester': { price: 150, duration: '4 months', description: 'Perfect for one trimester' },
  '3-trimester': { price: 400, duration: '12 months', description: 'Best value for full year' },
  '1-year': { price: 500, duration: '12 months', description: 'Staff annual membership' },
  'premium': { price: 800, duration: '12 months', description: 'All-access premium features' }
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
    role: "",
    membershipType: "",
    phone: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    paymentMethod: "credit_card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    billingAddress: "",
    agreeTerms: false,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateCardNumber = (cardNumber: string) => {
    // Remove spaces and non-digits
    const cleanCard = cardNumber.replace(/\D/g, '')
    
    // Check if it's 13-19 digits (standard card length)
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      return false
    }
    
    // Simple Luhn algorithm check
    let sum = 0
    let isEven = false
    
    for (let i = cleanCard.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanCard[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  const validateExpiryDate = (expiry: string) => {
    const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!pattern.test(expiry)) return false
    
    const [month, year] = expiry.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    const expYear = parseInt(year)
    const expMonth = parseInt(month)
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false
    }
    
    return true
  }

  const validateStudentId = (studentId: string) => {
    // Must be 6-10 digits for JCU student IDs
    if (!studentId || typeof studentId !== 'string') return false
    const cleaned = studentId.trim()
    return /^\d{6,10}$/.test(cleaned)
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
    return formatted
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + (cleaned.length > 2 ? '/' + cleaned.substring(2, 4) : '')
    }
    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!formData.agreeTerms) {
      setError("Please agree to the terms and conditions")
      setIsLoading(false)
      return
    }

    // Validate JCU email
    if (!formData.email.endsWith('@my.jcu.edu.au')) {
      setError("Please use your official JCU email address (@my.jcu.edu.au)")
      setIsLoading(false)
      return
    }

    // Validate student ID
    if (!validateStudentId(formData.studentId)) {
      setError("Student ID must be 6-10 digits (e.g., 14742770)")
      setIsLoading(false)
      return
    }

    // Validate payment details if credit card is selected
    if (formData.paymentMethod === "credit_card") {
      if (!validateCardNumber(formData.cardNumber)) {
        setError("Please enter a valid card number")
        setIsLoading(false)
        return
      }

      if (!validateExpiryDate(formData.expiryDate)) {
        setError("Please enter a valid expiry date (MM/YY)")
        setIsLoading(false)
        return
      }

      if (!formData.cvv || formData.cvv.length < 3) {
        setError("Please enter a valid CVV")
        setIsLoading(false)
        return
      }

      if (!formData.cardHolder.trim()) {
        setError("Please enter the card holder name")
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/auth/registration-success")
      } else {
        const data = await response.json()
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }

    setIsLoading(false)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      // If changing role, reset membership type since different roles have different membership options
      if (field === "role") {
        return { ...prev, [field]: value, membershipType: "" }
      }
      return { ...prev, [field]: value }
    })
  }

  const calculateExpiryDate = () => {
    if (!formData.membershipType) return null
    const today = new Date()
    const membership = MEMBERSHIP_PRICES[formData.membershipType as keyof typeof MEMBERSHIP_PRICES]
    const months = membership.duration === '4 months' ? 4 : 12
    const expiryDate = new Date(today.setMonth(today.getMonth() + months))
    return expiryDate.toLocaleDateString()
  }

  const getSelectedMembershipPrice = () => {
    if (!formData.membershipType) return null
    return MEMBERSHIP_PRICES[formData.membershipType as keyof typeof MEMBERSHIP_PRICES]
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.studentId || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all required fields")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }
      if (!formData.email.endsWith('@my.jcu.edu.au')) {
        setError("Please use your official JCU email address (@my.jcu.edu.au)")
        return
      }
      if (!validateStudentId(formData.studentId)) {
        setError("Student ID must be 6-10 digits (e.g., 14742770)")
        return
      }
    }
    if (currentStep === 2) {
      // Validate step 2
      if (!formData.role) {
        setError("Please select your role (Student or Staff)")
        return
      }
      if (!formData.membershipType) {
        setError("Please select a membership type")
        return
      }
    }
    if (currentStep === 3) {
      // Validate step 3 (payment)
      if (formData.paymentMethod === "credit_card") {
        if (!validateCardNumber(formData.cardNumber)) {
          setError("Please enter a valid card number")
          return
        }
        if (!validateExpiryDate(formData.expiryDate)) {
          setError("Please enter a valid expiry date (MM/YY)")
          return
        }
        if (!formData.cvv || formData.cvv.length < 3) {
          setError("Please enter a valid CVV")
          return
        }
        if (!formData.cardHolder.trim()) {
          setError("Please enter the card holder name")
          return
        }
      }
    }
    setError("")
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setError("")
    setCurrentStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="border-2 border-blue-100 shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-amber-500 text-white rounded-t-lg">
            <div className="flex items-center justify-center mb-4">
              {/* JCU Official Logo */}
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg p-1 mr-3">
                <svg viewBox="0 0 200 150" className="w-full h-full">
                  {/* JCU Logo Recreation */}
                  <defs>
                    <linearGradient id="sunGradientRegister" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B"/>
                      <stop offset="100%" stopColor="#D97706"/>
                    </linearGradient>
                    <linearGradient id="waveGradientRegister" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB"/>
                      <stop offset="100%" stopColor="#1D4ED8"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Sun */}
                  <circle cx="150" cy="30" r="18" fill="url(#sunGradientRegister)"/>
                  <path d="M150,5 L155,20 L170,15 L160,25 L175,30 L160,35 L170,45 L155,40 L150,55 L145,40 L130,45 L140,35 L125,30 L140,25 L130,15 L145,20 Z" fill="url(#sunGradientRegister)"/>
                  
                  {/* Ocean Waves */}
                  <path d="M10,60 Q50,45 90,60 T170,60 L170,90 Q130,75 90,90 T10,90 Z" fill="url(#waveGradientRegister)"/>
                  <path d="M10,80 Q50,65 90,80 T170,80 L170,110 Q130,95 90,110 T10,110 Z" fill="url(#waveGradientRegister)" opacity="0.8"/>
                  <path d="M10,100 Q50,85 90,100 T170,100 L170,130 Q130,115 90,130 T10,130 Z" fill="url(#waveGradientRegister)" opacity="0.6"/>
                  
                  {/* JCU Letters */}
                  <text x="20" y="45" fontSize="24" fontWeight="bold" fill="#1F2937">JCU</text>
                </svg>
              </div>
              <Dumbbell className="h-10 w-10 mr-3" />
              <CardTitle className="text-3xl font-bold">JCU Gym Registration</CardTitle>
            </div>
            <CardDescription className="text-blue-100 text-lg font-medium">
              Join James Cook University Fitness Center
            </CardDescription>
            
            {/* Progress Indicator */}
            <div className="flex justify-center mt-6 space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`flex items-center ${step < 3 ? 'mr-4' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
                  }`}>
                    {currentStep > step ? <CheckCircle2 className="h-6 w-6" /> : step}
                  </div>
                  {step < 3 && <div className={`w-8 h-1 ${currentStep > step ? 'bg-white' : 'bg-blue-400'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2 text-sm">
              <span className="mr-8">Account</span>
              <span className="mr-8">Membership</span>
              <span>Payment</span>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-300">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Account Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                      <User className="h-6 w-6 mr-2 text-blue-600" />
                      Account Information
                    </h3>
                    <p className="text-gray-600 mt-2">Enter your personal details</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-lg font-semibold text-gray-700">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                        className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-lg font-semibold text-gray-700">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData("lastName", e.target.value)}
                        className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-semibold text-gray-700 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-blue-600" />
                      JCU Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500">Use your official JCU email address</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-lg font-semibold text-gray-700">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                      placeholder="e.g., +61 400 123 456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-lg font-semibold text-gray-700 flex items-center">
                      <IdCard className="h-5 w-5 mr-2 text-blue-600" />
                      Student ID
                    </Label>
                    <Input
                      id="studentId"
                      placeholder="e.g., 14742770"
                      value={formData.studentId}
                      onChange={(e) => updateFormData("studentId", e.target.value)}
                      className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500">Must be 6-10 digits</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-lg font-semibold text-gray-700 flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-blue-600" />
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-lg font-semibold text-gray-700">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                        className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Role and Membership Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
                      Membership Selection
                    </h3>
                    <p className="text-gray-600 mt-2">Choose your role and membership plan</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-gray-700 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      Role
                    </Label>
                    <Select onValueChange={(value) => updateFormData("role", value)} value={formData.role}>
                      <SelectTrigger className="h-12 text-lg border-2 border-blue-200">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-700">Membership Type</Label>
                    {!formData.role ? (
                      <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">Please select your role first to see available membership options</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {Object.entries(MEMBERSHIP_PRICES).map(([type, details]) => {
                          // Filter membership types based on role
                          if (formData.role === "student" && !["1-trimester", "3-trimester"].includes(type)) return null
                          if (formData.role === "staff" && !["1-year", "premium"].includes(type)) return null
                          
                          return (
                            <div
                              key={type}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.membershipType === type
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                              onClick={() => updateFormData("membershipType", type)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-bold text-lg capitalize">
                                    {type.replace('-', ' ')} Membership
                                  </h4>
                                  <p className="text-gray-600">{details.description}</p>
                                  <p className="text-sm text-gray-500 mt-1">Duration: {details.duration}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600">S${details.price}</div>
                                  <Badge variant={formData.membershipType === type ? "default" : "outline"}>
                                    {formData.membershipType === type ? "Selected" : "Select"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {formData.membershipType && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center text-green-800">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Membership expires: {calculateExpiryDate()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                      Payment Information
                    </h3>
                    <p className="text-gray-600 mt-2">Complete your membership payment</p>
                  </div>

                  {getSelectedMembershipPrice() && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">
                          {formData.membershipType?.replace('-', ' ')} Membership
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          S${getSelectedMembershipPrice()?.price}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Duration: {getSelectedMembershipPrice()?.duration}</p>
                        <p>Expires: {calculateExpiryDate()}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-gray-700">Payment Method</Label>
                    <Select onValueChange={(value) => updateFormData("paymentMethod", value)} value={formData.paymentMethod}>
                      <SelectTrigger className="h-12 text-lg border-2 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.paymentMethod === "credit_card" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardHolder" className="text-lg font-semibold text-gray-700">Card Holder Name</Label>
                        <Input
                          id="cardHolder"
                          value={formData.cardHolder}
                          onChange={(e) => updateFormData("cardHolder", e.target.value)}
                          className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                          placeholder="Full name on card"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-lg font-semibold text-gray-700">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value)
                            updateFormData("cardNumber", formatted)
                          }}
                          className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                        {formData.cardNumber && !validateCardNumber(formData.cardNumber) && (
                          <p className="text-sm text-red-500">Please enter a valid card number</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate" className="text-lg font-semibold text-gray-700">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => {
                              const formatted = formatExpiryDate(e.target.value)
                              updateFormData("expiryDate", formatted)
                            }}
                            className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                          {formData.expiryDate && !validateExpiryDate(formData.expiryDate) && (
                            <p className="text-sm text-red-500">Invalid expiry date</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv" className="text-lg font-semibold text-gray-700">CVV</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '')
                              updateFormData("cvv", cleaned)
                            }}
                            className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress" className="text-lg font-semibold text-gray-700">Billing Address</Label>
                    <Input
                      id="billingAddress"
                      value={formData.billingAddress}
                      onChange={(e) => updateFormData("billingAddress", e.target.value)}
                      className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                      placeholder="Full address"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => updateFormData("agreeTerms", checked)}
                    />
                    <Label htmlFor="agreeTerms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="px-8 py-3 text-lg"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Processing..." : "Complete Registration"}
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
