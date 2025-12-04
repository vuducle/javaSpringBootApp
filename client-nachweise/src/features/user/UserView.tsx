"use client"
import { useTranslation} from "@/context/LanguageContext";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useToast} from "@/hooks/useToast";
import useSWR, {useSWRConfig} from "swr";
import {useState} from "react";
import api from "@/lib/api";

interface Benutzer {
    id: string;
    username: string;
    name: string;
    email: string;
    profileImageUrl: string;
    ausbildungsjahr: number;
    telefonnummer: string;
    team: string;
}

interface BenutzerResponse {
    benutzer: Benutzer;
    totalPages: number;
}

const fetcher = async (
    url: string,
    params: Record<string, unknown>
) => {
    const res = await api.get<BenutzerResponse>(url, { params });
    console.log(res)
    return res.data;
}

export default function UserView() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const {
        mutate
    } = useSWRConfig();
    const [status, setStatus] = useState<string>('ALLE');
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(10);

    const {
        data,
        error,
        isLoading
    } = useSWR(
        [
            '/api/user/users',
            {
                page,
                size
            }
        ],
        ([url, params]) => fetcher(url, params),
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            keepPreviousData: true,
        }
    )


    return (
        <>
            <div className="container mx-auto p-4 py-5 md:py-10 lg:py-20">
                <h1 className="text-2xl font-bold mb-4">{t('userPage.title')}</h1>
                <div className="flex justify-between items-center flex-wrap mb-4">
                    <div className="flex items-center space-x-2">
                        <Select>
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={t('userPage.all')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALLE">
                                    {t('userPage.all')}
                                </SelectItem>
                                <SelectItem value="USER">
                                    {t('userPage.azubis')}
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                    {t('userPage.ausbilder')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                            <label className="text-sm">
                                {t('nachweis.pageSize')}:
                            </label>
                            <Select>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-sm">
                                {t('userPage.sortBy') ?? 'Sort By'}
                            </label>
                            <Select></Select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}