"use server";

import puppeteer from 'puppeteer-core';
import { JobDocument } from '@/lib/models/job.model';

const credential = String(process.env.BRIGHT_DATA_CREDENTIAL);


export async function scrapeJobs(URL: string) {
    //Set up Bright Data connection
    const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://${credential}@brd.superproxy.io:9222`,
    })
    const page = await browser.newPage();

    //set viewport
    await page.setViewport({
        width: 1920,
        height: 1080,
    })

    //go to target page
    await page.goto(URL, {
        waitUntil: 'networkidle0',
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    //Store the extracted job data
    let jobs: JobDocument[] = [];
    let pagesScraped = 0;
    const pagesToScrape = 1;

    while (pagesScraped < pagesToScrape) {
        console.log(pagesScraped);
        //Wait for job cards to be loaded
        try {
            await page.waitForSelector('#mosaic-provider-jobcards', { timeout: 10000 });
        } catch (error:any) {
            console.error(`Job cards not found: ${error.message}`);
            break;
        }
          
       
        const jobCards = await page.$$('.cardOutline');

        for (const jobCard of jobCards) {
            
            const job: Partial<JobDocument> = {
                jobPostUrl: undefined,
                postedAt: undefined,
                companyName: undefined,
                title: undefined,
                location: undefined,
                jobType: undefined,
                applyLink: undefined,
                salary: undefined,
                skills: [],
                description: undefined,
            }
           
            //Get the job post's url
            try {
                const jobLinkElement = await jobCard.$('a[data-jk]');
                const jobId = jobLinkElement ? await page.evaluate(el => el.getAttribute('data-jk'), jobLinkElement) : null;
                if (jobId) {
                    job.jobPostUrl = `${URL}&vjk=${jobId}`;
                } 
            } catch (error: any) {
                console.error(`Failed to extract job URL: ${error.message}`);
                throw new Error(`Job cards not found: ${error.message}`);
            }

            //Get the posted date
            try {
                const dateElement = await jobCard.$('[data-testid="myJobsStateDate"]');
                if (dateElement) {
                    const postedAt = await page.evaluate(el => el.textContent?.trim(), dateElement);
                    const postedAtReplaced = postedAt?.replace(/Just posted|Posted (\d+\+?) days ago|Posted 1 day ago/, function(match, p1) {
                        if (match === "Just posted") {
                            return "0";
                        } else if (match === "Posted 1 day ago") {
                            return "1";
                        } else {
                            return p1;
                        }
                    });
                    
                    job.postedAt = postedAtReplaced?.slice(6) || "";
                }
            } catch (error: any) {
                throw new Error(`Failed to extract date: ${error.message}`);
            }

            //Get the company name
            try {
                const companyNameElement = await jobCard.$('[data-testid="company-name"]');
                if (companyNameElement) {
                    job.companyName = await page.evaluate(el => el.textContent?.trim(), companyNameElement);
                }
            } catch (error: any) {
                throw new Error(`Failed to extract company name: ${error.message}`);
            }

            //Open the job details
            await jobCard.click();

            let jobDetailsElement;
            try {
                jobDetailsElement = await page.waitForSelector('.jobsearch-RightPane', { timeout: 9000 });
            } catch (error) {
                console.error('Job details not found:', error);
            }

            if (jobDetailsElement) {
                //Get the company name
                try {
                    const companyNameElement = await jobDetailsElement.$('[data-testid="jobsearch-CollapsedEmbeddedHeader-companyName"] a');
                    if (companyNameElement) {
                        job.companyName = await page.evaluate(el => el.textContent?.trim(), companyNameElement);
                    }
                } catch (error: any) {
                    throw new Error(`Failed to extract company name: ${error.message}`);
                }

                //Get the job title
                try {
                    const titleElement = await jobDetailsElement.$('.jobsearch-JobInfoHeader-title');
                    if (titleElement) {
                        job.title = await page.evaluate(el => el.textContent?.replace('\n- job post', '').trim(), titleElement);
                    }
                } catch (error: any) {
                    throw new Error(`Failed to extract title: ${error.message}`);
                }

                //Get the company location & job type
                try {
                    const companyLocationAndJobType =  await jobDetailsElement.$('[data-testid="inlineHeader-companyLocation"]');
                    if (companyLocationAndJobType) {
                        const companyLocationAndJobTypeText = await page.evaluate(el => el.textContent?.trim(), companyLocationAndJobType);

                        if (companyLocationAndJobTypeText?.includes('•')) {
                            const arr = companyLocationAndJobTypeText.split('•');
                            job.location = arr[0].trim();
                            job.jobType = arr[1].trim();
                        } else {
                            job.location = companyLocationAndJobTypeText;
                            job.jobType = "";
                        }
                    }
                } catch (error: any) {
                    throw new Error(`Failed to extract company location and job type: ${error.message}`);
                }

                //Get the apply link
                try {
                    const applyLinkElement = await jobDetailsElement.$('#applyButtonLinkContainer button');
                    if (applyLinkElement) {
                        const href = await page.evaluate(el => el.getAttribute('href'), applyLinkElement);
                        if (href !== null) {
                            job.applyLink = href;
                        }
                    }
                } catch (error: any) {
                    throw new Error(`Failed to extract apply link: ${error.message}`);
                }

                //Get the salary 
                try {
                    const salaryElement = await jobDetailsElement.$('#salaryInfoAndJobType');
                    if (salaryElement) {
                        const salaryText = await salaryElement.$eval('span:first-child' ,el => el.textContent?.trim());
                        const salary = salaryText?.replace('a year', '').trim();
                        job.salary = salary;
                    }
                } catch (error: any) {
                    throw new Error(`Failed to extract salary: ${error.message}`);
                }

                //Get the skills
                try {
                    const skillsElement = await jobDetailsElement.$('div[aria-label="Skills"] ul');
                    if (skillsElement) {
                        job.skills = await skillsElement.$$eval('li div div:first-child', els => els.map(el => el.textContent?.trim())
                            .filter((skill): skill is string => skill !== undefined) as string[]);
                    } 
                } catch (error: any) {
                    throw new Error(`Failed to extract skills: ${error.message}`);
                }

                //Get the job description
                try {
                    const jobDescriptionElement = await jobDetailsElement.$('#jobDescriptionText');
                    if (jobDescriptionElement) {
                        //Remove multiple new lines and trim whitespace
                        job.description = await page.evaluate(el => el.textContent?.replace(/\n+/g, ' ').trim(), jobDescriptionElement);
                    }
                } catch (error: any) {
                    throw new Error(`Failed to extract job description: ${error.message}`);
                }
            }  
            console.log(job);
            jobs.push(job as JobDocument);

            //Avoid rate limiting blocks
            await new Promise(resolve => setTimeout(resolve, Math.random() * 4000 + 1000));
        }

        pagesScraped += 1;

        if (pagesScraped < pagesToScrape) {
            try {
                const nextPageElement = await page.$('a[data-testid=pagination-page-next]');
                if (nextPageElement) {
                    await nextPageElement.click();
                } else {
                    break;
                }
            } catch (error: any) {
                throw new Error(`Failed to click next page: ${error.message}`);
            }
        }
    }

    await browser.close();

    return jobs;
}
