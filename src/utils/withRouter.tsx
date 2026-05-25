import React from 'react';
import {
    NavigateFunction,
    Params,
    useLocation,
    useNavigate,
    useParams
} from 'react-router-dom';

export interface IRouteComponentProps {
    history: {
        push: (path: string) => void
        replace: (path: string) => void
        goBack: () => void
    }
    location: ReturnType<typeof useLocation>
    navigate: NavigateFunction
    params: Readonly<Params<string>>
}

export function withRouter<P extends IRouteComponentProps>(Component: React.ComponentType<P>) {
    const ComponentWithRouter = (props: Omit<P, keyof IRouteComponentProps>) => {
        const location = useLocation();
        const navigate = useNavigate();
        const params = useParams();

        const history = {
            push: (path: string) => navigate(path),
            replace: (path: string) => navigate(path, { replace: true }),
            goBack: () => navigate(-1)
        };

        return (
            <Component
                {...(props as P)}
                history={history}
                location={location}
                navigate={navigate}
                params={params}
            />
        );
    };

    ComponentWithRouter.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`;

    return ComponentWithRouter;
}
