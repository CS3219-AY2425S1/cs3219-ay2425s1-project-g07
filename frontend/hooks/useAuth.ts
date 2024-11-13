import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { verifyToken } from '@/services/userService';

const useAuth = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [userId, setUserId] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const checkToken = async () => {
			try {
				const response = await verifyToken();
				const { id, username, email, isAdmin } = response.data;
				setUserId(id);
				setUsername(username);
				setEmail(email);
				setIsAdmin(isAdmin);
				setIsAuthenticated(true);
			} catch (error) {
				router.push('/login');
			} finally {
				setIsLoading(false);
			}
		};

		checkToken();
	}, [router, pathname]);

	return { userId, username, email, isAdmin, isLoading, isAuthenticated, setUsername, setEmail };
};

export default useAuth;
