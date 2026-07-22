import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT ,ANALYZE_API_END_POINT} from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = () => {
    const {singleJob} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {withCredentials:true});
            
            if(res.data.success){
                setIsApplied(true); // Update the local state
                const updatedSingleJob = {...singleJob, applications:[...singleJob.applications,{applicant:user?._id}]}
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }
    const handleAnalyzeResume = async () => {
    try {
        setLoading(true);
        const res = await axios.post(
        `${ANALYZE_API_END_POINT}/${singleJob._id}`,
        {},
        {
            withCredentials: true,
        }
        );

        setAnalysis(res.data.analysis);
    } catch (error) {
        console.error(error);
        toast.error(
       error.response?.data?.message ||
      "AI service is busy. Please try again in a few moments."
);
    }
    finally {
    setLoading(false);
    }
    };

    useEffect(()=>{
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application=>application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob(); 
    },[jobId,dispatch, user?._id]);

    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <p className="text-gray-500 mt-1">
                        {singleJob?.company?.name} • {singleJob?.location}
                    </p>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.position} Positions</Badge>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.salary}LPA</Badge>
                    </div>
                </div>
                <div className="flex gap-3">
           <Button
        onClick={isApplied ? null : applyJobHandler}
        disabled={isApplied}
        className={`px-6 py-2 rounded-lg ${
            isApplied
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
        }`}
         >
        {isApplied ? "Already Applied" : "Apply Now"}
    </Button>

            <Button
            variant="outline"
            onClick={handleAnalyzeResume}
            disabled={loading}
            >
            {loading ? "Analyzing..." : "Analyze Resume"}
        </Button>
            </div>
            </div>
            <div className="max-w-7xl mx-auto my-10">
                <h1 className='text-2xl font-bold mt-8 mb-4'> Job Overview</h1>
                  
            <div className='my-4 bg-white border rounded-lg p-6 shadow-sm'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary}LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt.split("T")[0]}</span></h1>
            </div>

            {analysis && (
                <div className="mt-8 p-6 border rounded-lg bg-white shadow">
                    <div className="border-b pb-3 mb-4">
                        <h2 className="text-2xl font-bold">Resume Analysis</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            AI-powered ATS compatibility report</p>
                    </div>
                   <div className="flex items-center gap-3 mb-5">
                    <span className="font-semibold">Match Score:</span>
                    <Badge
                        className={`${
                            analysis.matchScore >= 80
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : analysis.matchScore >= 60
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                        }`}
                        variant="outline"
                    >
                        {analysis.matchScore}%
                    </Badge>
                </div>
                   <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <p className="text-gray-700 leading-7">
                        {analysis.summary}
                    </p>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">
                        Matching Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {analysis.matchingSkills.map((skill, index) => (
                            <Badge
                                key={index}
                                className="bg-green-100 text-green-700 hover:bg-green-100"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">
                        Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((skill, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="border-red-300 text-red-600"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">
                        Strengths
                    </h3>

                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {analysis.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                        ))}
                    </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Weaknesses */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">
                            Weaknesses
                        </h3>

                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {analysis.weaknesses.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    {/* Suggestions */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">
                            Suggestions
                        </h3>

                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {analysis.suggestions.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">
                            Interview Topics
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {analysis.interviewTopics.map((topic, index) => (
                                <Badge key={index} variant="secondary">
                                    {topic}
                                </Badge>
                            ))}
                        </div>
                    </div>
    

                </div>
              )}

            </div>
            
        </div>
    )
}

export default JobDescription