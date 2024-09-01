"use client";

import { useState } from "react";
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Spinner from "@/components/spinner";
import { FaGithub } from "react-icons/fa";

export default function Home() {
  const [firstIsLoading, setFirstIsLoading] = useState(false);
  const [secondIsLoading, setSecondIsLoading] = useState(false);
  const [resultsCount, setResultsCount] = useState("");
  const [firstResponse, setFirstResponse] = useState<string | null>(null);
  const [secondResponse, setSecondResponse] = useState<string | null>(null);

  const handleFetchAllJobs = async () => {
    setFirstIsLoading(true);
    setFirstResponse(null); 
    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      setFirstResponse(JSON.stringify(data, null, 2)); 
    } catch (error: any) {
      setFirstResponse(error.message); 
      console.error(error);
    } finally {
      setFirstIsLoading(false);
    }
  };

  const handleFetchJobs = async () => {
    setSecondIsLoading(true);
    setSecondResponse(null); 
    try {
      const response = await fetch(`/api/jobs?results=${resultsCount}`);
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      setSecondResponse(JSON.stringify(data, null, 2)); 
    } catch (error:any) {
      setSecondResponse(error.message); 
      console.error(error);
    } finally {
      setSecondIsLoading(false);
    }
  };

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
                {firstIsLoading && (
                  <div className="py-4 flex justify-center">
                    <Spinner />
                  </div>
                )}
                {!firstIsLoading && firstResponse && (
                  <div className="bg-white text-black p-4 overflow-auto max-h-64 max-w-full border rounded">
                    <pre className="whitespace-pre-wrap">
                      {firstResponse}
                    </pre>
                  </div>
                )}
                <button
                  onClick={handleFetchAllJobs}
                  className={`bg-blue-600 text-white px-4 py-2 rounded focus:outline-none ${firstIsLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                  disabled={firstIsLoading}
                >
                  Fetch Jobs
                </button>
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
                <p className="italic text-xs md:text-sm lg:text-base">
                  If the number exceeds the total number of records, then all records are returned
                </p>
                <input
                  type="number"
                  placeholder="Enter a number"
                  value={resultsCount}
                  onChange={(e) => setResultsCount(e.target.value)}
                  className="p-2 border rounded text-black"
                />
                {secondIsLoading && (
                  <div className="py-4 flex justify-center">
                    <Spinner />
                  </div>
                )}
                {!secondIsLoading && secondResponse && (
                  <div className="bg-white text-black p-4 overflow-auto max-h-64 max-w-full border rounded">
                    <pre className="whitespace-pre-wrap">
                      {secondResponse}
                    </pre>
                  </div>
                )}
                <button
                  onClick={handleFetchJobs}
                  className={`bg-blue-600 text-white px-4 py-2 rounded focus:outline-none ${secondIsLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                  disabled={secondIsLoading}
                >
                  Fetch Jobs
                </button>
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
