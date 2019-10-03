import { connect } from 'react-redux';
import { Input as InputComponent } from '../components/Input';
import { addHistory } from '../actions/Input';

export const Input = connect(({ history }: any) => ({ history }), { addHistory })(InputComponent);
