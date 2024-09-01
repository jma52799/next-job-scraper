"use client";

import { useState } from "react";
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import firstResponse from "@/components/first-response";
import secondResponseIn from "@/components/second-response-in";
import secondResponseOut from "@/components/second-response-out";
import { FaGithub } from "react-icons/fa";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md lg:max-w-lg border-b border-white pb-2 flex justify-between items-center">
        <p className="text-left text-white text-base md:text-lg lg:text-xl">Job Scraper APIs Usage</p>
        <a 
          href="https://github.com/jma52799/next-job-scraper" 
          className="flex items-center text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub className="mr-2" /> 
          <span>GitHub</span>
        </a>
      </div>

      <div className="w-full max-w-md lg:max-w-lg border border-white mt-4 p-4 md:p-6 lg:p-8">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="mt-4 lg:mt-6">
            <AccordionTrigger className="text-base md:text-lg lg:text-xl">
              GET /api/jobs
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base lg:text-lg">
              <div className="flex flex-col space-y-4 mt-4">
                <p>Fetches all job records from the database</p>
                <p>A successful request will return data in the format shown below:</p>
                <div className="bg-white text-black p-4 overflow-auto max-h-64 max-w-full border rounded">
                  <pre className="whitespace-pre-wrap">
                    {firstResponse} 
                  </pre>
                </div>
                <p className="italic text-xs text-gray-500 mt-2">
                    Note: This is a sample response that simulates what would be returned from the API. This is used because the actual API fetching within the application causes timeouts on Vercel.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="mt-4 lg:mt-6">
            <AccordionTrigger className="text-base md:text-lg lg:text-xl">
              GET /api/jobs?results=&#123;INTEGER&#125;
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base lg:text-lg">
              <div className="flex flex-col space-y-4 mt-4">
                <p>Fetches the first specified number of job records from the database</p>
                <p>A successful request will return data in the format shown below:</p>
                <p className="italic text-xs md:text-sm lg:text-base">
                  E.g: GET api/jobs?results=5
                </p>
                <div className="bg-white text-black p-4 overflow-auto max-h-64 max-w-full border rounded">
                  <pre className="whitespace-pre-wrap">
                    {secondResponseIn} 
                  </pre>
                </div>
                <p className="italic text-xs text-gray-500 mt-2">
                    Note: This is a sample response that simulates what would be returned from the API. This is used because the actual API fetching within the application causes timeouts on Vercel.
                </p>
                <p>Note: If the number exceeds the total number of records, then all records are returned. </p>
                <p className="italic text-xs md:text-sm lg:text-base">
                  E.g: GET api/jobs?results=500
                </p>
                <div className="bg-white text-black p-4 overflow-auto max-h-64 max-w-full border rounded">
                  <pre className="whitespace-pre-wrap">
                    {secondResponseOut} 
                  </pre>
                </div>
                <p className="italic text-xs text-gray-500 mt-2">
                    Note: This is a sample response that simulates what would be returned from the API. This is used because the actual API fetching within the application causes timeouts on Vercel.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="mt-4 lg:mt-6">
            <AccordionTrigger className="text-base md:text-lg lg:text-xl">
              POST /api/cron/scrape
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base lg:text-lg">
              <div className="flex flex-col space-y-4 mt-4">
                <p>Scrapes job listings from LinkedIn and stores them in the database (only if it is not a duplicate of an existing record)</p>
                <p className="text-red-500 font-semibold">Note: This API is intended for internal application usage only.</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Clone the repo: <b>git clone https://github.com/jma52799/job-scraper.git</b></li>
                  <li>Install the libraries: <b>npm install</b></li>
                  <li>Follow the format in <b>.env.example</b> and add your own MongoDB and Bright Data credentials</li>
                </ol>
                <p>A successful scrape will return the following:</p>
                <Image 
                  src="/scrape.png" 
                  alt="Successful scrape example" 
                  width={800} 
                  height={600} 
                  className="border rounded-lg max-w-full h-auto" 
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
